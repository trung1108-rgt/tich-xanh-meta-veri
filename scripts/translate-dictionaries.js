import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_LANG = 'en';
const DICT_DIR = path.join(__dirname, '..', 'dictionaries');
const REQUEST_DELAY = 300;

const getTargetLanguages = () => {
    const files = fs.readdirSync(DICT_DIR);
    return files.filter((file) => file.endsWith('.json') && file !== `${SOURCE_LANG}.json`).map((file) => path.basename(file, '.json'));
};

const extractStrings = (obj, path = []) => {
    const results = [];
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        if (typeof value === 'string') {
            results.push({ path: currentPath, value });
        } else if (typeof value === 'object' && value !== null) {
            results.push(...extractStrings(value, currentPath));
        }
    }
    return results;
};

const setValueByPath = (obj, path, value) => {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in current)) current[key] = {};
        current = current[key];
    }
    current[path[path.length - 1]] = value;
};

const translateText = async (text, targetLang) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return (
        data?.[0]
            ?.map((item) => item[0])
            .filter(Boolean)
            .join('') || text
    );
};

const translateLanguage = async (sourceData, strings, lang) => {
    const translated = structuredClone(sourceData);

    for (let i = 0; i < strings.length; i++) {
        const { path, value } = strings[i];

        if (/^\{[\w()]+\}$/.test(value)) continue;

        try {
            const translatedText = await translateText(value, lang);
            setValueByPath(translated, path, translatedText);

            if ((i + 1) % 10 === 0) {
                console.log(`  Progress: ${i + 1}/${strings.length}`);
            }

            await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));
        } catch (error) {
            console.error(`  Error: ${error.message}`);
        }
    }

    return translated;
};

const languages = getTargetLanguages();
const sourceFile = path.join(DICT_DIR, `${SOURCE_LANG}.json`);
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const strings = extractStrings(sourceData);

for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    console.log(`[${i + 1}/${languages.length}] ${lang}...`);

    const translated = await translateLanguage(sourceData, strings, lang);
    const outputFile = path.join(DICT_DIR, `${lang}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(translated, null, 4));
}
