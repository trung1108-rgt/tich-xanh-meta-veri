import { countryToLanguage } from '@/utils/config';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const GET = async () => {
    const headersList = await headers();
    const ip = headersList.get('cf-connecting-ip') || headersList.get('x-nf-client-connection-ip') || headersList.get('x-forwarded-for')?.split(',')[0].trim() || headersList.get('x-real-ip') || 'unknown';

    if (ip === 'unknown') {
        return NextResponse.json(
            {
                ip: 'unknown',
                language_code: 'en',
                content_locale: 'us',
                response_source: 'fallback'
            },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            const countryCode = 'US';
            const languageCode = countryToLanguage[countryCode] || 'en';

            return NextResponse.json({
                ip,
                country_code: countryCode,
                language_code: languageCode,
                content_locale: countryCode.toLowerCase(),
                response_source: 'header_based'
            });
        }

        const data = await response.json();
        const countryCode = data.country_code?.toUpperCase() || 'US';
        const languageCode = countryToLanguage[countryCode] || 'en';

        return NextResponse.json({
            ip: data.ip,
            country: data.country,
            country_code: countryCode,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
            asn: Number(data.asn),
            organization: data.organization,
            language_code: languageCode,
            content_locale: countryCode.toLowerCase(),
            response_source: 'geojs_api'
        });
    } catch {
        const countryCode = 'US';
        const languageCode = countryToLanguage[countryCode] || 'en';
        return NextResponse.json({
            ip,
            country_code: countryCode,
            language_code: languageCode,
            content_locale: countryCode.toLowerCase(),
            response_source: 'error_fallback'
        });
    }
};
export { GET };
