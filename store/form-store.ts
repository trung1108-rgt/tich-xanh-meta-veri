import type { ChangeEvent } from 'react';
import { create } from 'zustand';

interface FormData {
    fullName: string;
    email: string;
    businessEmail: string;
    pageName: string;
    phoneNumber: string;
    dobDay: string;
    dobMonth: string;
    dobYear: string;
    agreeTerms: boolean;
}

interface FormStore extends FormData {
    setField: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setPhoneNumber: (phoneNumber: string) => void;
    getDateOfBirth: () => string;
    resetForm: () => void;
    validationErrors: Record<string, string>;
    setValidationError: (field: string, message: string) => void;
    clearValidationError: (field: string) => void;
    clearAllValidationErrors: () => void;
    messageId: string | null;
    setMessageId: (messageId: string | null) => void;
    savedMessage: string | null;
    setSavedMessage: (message: string | null) => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
    fullName: '',
    email: '',
    businessEmail: '',
    pageName: '',
    phoneNumber: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    agreeTerms: false,
    validationErrors: {},
    messageId: null,
    savedMessage: null,
    setField: (e) => {
        const { name, value, type } = e.target;
        set({ [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
        const { validationErrors } = get();
        if (validationErrors[name]) {
            const newErrors = { ...validationErrors };
            delete newErrors[name];
            set({ validationErrors: newErrors });
        }
    },
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
    getDateOfBirth: () => {
        const { dobDay, dobMonth, dobYear } = get();
        if (!dobDay || !dobMonth || !dobYear) return '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[Number.parseInt(dobMonth) - 1]} ${dobDay}, ${dobYear}`;
    },
    setValidationError: (field, message) => {
        const { validationErrors } = get();
        set({
            validationErrors: {
                ...validationErrors,
                [field]: message
            }
        });
    },
    clearValidationError: (field) => {
        const { validationErrors } = get();
        const newErrors = { ...validationErrors };
        delete newErrors[field];
        set({ validationErrors: newErrors });
    },
    clearAllValidationErrors: () => set({ validationErrors: {} }),
    setMessageId: (messageId) => set({ messageId }),
    setSavedMessage: (message) => set({ savedMessage: message }),
    resetForm: () =>
        set({
            fullName: '',
            email: '',
            businessEmail: '',
            pageName: '',
            phoneNumber: '',
            dobDay: '',
            dobMonth: '',
            dobYear: '',
            agreeTerms: false,
            validationErrors: {},
            messageId: null,
            savedMessage: null
        })
}));
