'use client';

import type { FC } from 'react';

interface ValidationMessageProps {
    message: string;
    type?: 'error' | 'warning';
    visible: boolean;
    id?: string;
}

const ValidationMessage: FC<ValidationMessageProps> = ({ message, type = 'error', visible, id }) => {
    if (!visible || !message) return null;

    const baseClasses = 'text-xs mt-1 transition-all duration-200 ease-in-out';
    const typeClasses = type === 'error' ? 'text-red-600' : 'text-yellow-600';

    return (
        <div id={id} role='alert' className={`${baseClasses} ${typeClasses}`} aria-live='polite'>
            {message}
        </div>
    );
};

export default ValidationMessage;
