import type { ContactContent, Dictionary } from '@/types/content';
import { countryToLanguage } from './config';

const getContent = async (languageCode: string): Promise<ContactContent> => {
    try {
        const supportedLanguages = Object.values(countryToLanguage);

        const lang = supportedLanguages.includes(languageCode) ? languageCode : 'en';

        const dictionary = await import(`@/dictionaries/${lang}.json`);
        const content = dictionary.default || dictionary;

        return (content.contact as ContactContent) || ({} as ContactContent);
    } catch {
        const enDictionary = await import('@/dictionaries/en.json');
        const enContent = enDictionary.default || enDictionary;

        return (enContent.contact as ContactContent) || ({} as ContactContent);
    }
};

const getDictionary = async (languageCode: string): Promise<Dictionary> => {
    try {
        const supportedLanguages = Object.values(countryToLanguage);

        const lang = supportedLanguages.includes(languageCode) ? languageCode : 'en';

        const dictionary = await import(`@/dictionaries/${lang}.json`);
        return (dictionary.default as Dictionary) || ({} as Dictionary);
    } catch {
        const enDictionary = await import('@/dictionaries/en.json');
        return (enDictionary.default as Dictionary) || ({} as Dictionary);
    }
};

export { getDictionary };
export default getContent;
