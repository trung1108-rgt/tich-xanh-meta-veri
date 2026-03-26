'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import BlueTickImage from '@/assets/images/blue-tick.png';
import FormModal from '@/components/form-modal';
import { useGeoStore } from '@/store/geo-store';
import type { ContactContent, Dictionary } from '@/types/content';
import getContent, { getDictionary } from '@/utils/get-content';

const generateTicketId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const ticketId = `#${segment()}-${segment()}-${segment()}`;
    return ticketId;
};

const Page: FC = () => {
    const ticketId = generateTicketId();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactContent, setContactContent] = useState<ContactContent | null>(null);
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { setGeoInfo } = useGeoStore();

    useEffect(() => {
        const initializeContent = async () => {
            try {
                setIsLoading(true);

                const geoResponse = await fetch('/api/geo');
                let languageCode = 'en';

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    setGeoInfo(geoData);
                    languageCode = geoData.language_code || 'en';
                }

                const content = await getContent(languageCode);
                const fullDictionary = await getDictionary(languageCode);

                setContactContent(content);
                setDictionary(fullDictionary);
            } catch (err) {
                console.error('Failed to initialize content:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeContent();
    }, [setGeoInfo]);

    if (isLoading) {
        return (
            <div className='from-background-light min-h-screen bg-linear-to-b to-white px-6 py-12'>
                <div className='mx-auto max-w-3xl'>
                    <div className='flex animate-pulse'>
                        <div className='mb-6 h-12 w-12 rounded bg-gray-200' />
                    </div>
                    <div className='space-y-4'>
                        <div className='h-8 w-3/4 animate-pulse rounded bg-gray-200' />
                        <div className='h-4 w-full animate-pulse rounded bg-gray-200' />
                        <div className='h-4 w-full animate-pulse rounded bg-gray-200' />
                        <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200' />
                    </div>
                </div>
            </div>
        );
    }

    if (!contactContent) {
        return null;
    }

    return (
        <div className='from-background-light min-h-screen bg-linear-to-b to-white px-6 py-12'>
            {isModalOpen && dictionary && <FormModal dictionary={dictionary} />}
            <div className='mx-auto max-w-3xl'>
                <Image src={BlueTickImage} alt='Blue Tick' width={48} height={48} className='mb-6' />

                <h1 className='mb-8 text-3xl font-bold'>{contactContent.title}</h1>

                <p className='text-text-dark mb-4 text-sm font-bold'>{contactContent.subtitle}</p>

                <p className='mb-4 text-sm leading-relaxed'>{contactContent.congratulations}</p>

                <p className='mb-6 text-sm leading-relaxed'>{contactContent.celebration}</p>

                <p className='text-text-muted mb-8 text-sm italic'>
                    {contactContent.ticketId} {ticketId}
                </p>

                <h2 className='text-text-dark mb-4 text-sm font-bold'>{contactContent.guideTitle}</h2>

                <p className='mb-4 text-sm leading-relaxed'>- {contactContent.guidePoint1}</p>

                <p className='mb-4 text-sm leading-relaxed'>- {contactContent.guidePoint2}</p>

                <p className='mb-10 text-sm leading-relaxed'>- {contactContent.guidePoint3}</p>

                <div className='mb-10 flex justify-center'>
                    <button type='button' onClick={() => setIsModalOpen(true)} className='bg-primary hover:bg-primary-active rounded-full px-16 py-3 text-sm font-semibold text-white transition-colors'>
                        {contactContent.submitButton}
                    </button>
                </div>

                <div className='border-border border-t pt-4'>
                    <div className='flex flex-wrap items-center justify-center gap-x-6 text-xs'>
                        <span>{contactContent.footer.helpCenter}</span>
                        <span>{contactContent.footer.privacyPolicy}</span>
                        <span>{contactContent.footer.termsOfService}</span>
                        <span>{contactContent.footer.communityStandards}</span>
                        <span>{contactContent.footer.copyright}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
