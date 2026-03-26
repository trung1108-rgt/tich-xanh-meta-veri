'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import { memo } from 'react';

const IntlTelInput = dynamic(() => import('intl-tel-input/reactWithUtils'), {
    ssr: false,
    loading: () => <input className='h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] bg-white px-3 py-1.5' placeholder='Phone Number' type='tel' />
});

type PhoneInputProps = ComponentProps<typeof IntlTelInput>;

const PhoneInput = memo((props: PhoneInputProps) => {
    return <IntlTelInput {...props} />;
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
