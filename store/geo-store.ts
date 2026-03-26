import { create } from 'zustand';

interface GeoInfo {
    ip: string;
    country: string;
    country_code: string;
    city: string;
    region: string;
    timezone: string;
    asn: number;
    organization: string;
}

interface GeoStore {
    geoInfo: GeoInfo | null;
    setGeoInfo: (info: GeoInfo) => void;
    messageId: string | null;
    setMessageId: (id: string | null) => void;
    messageContent: string;
    setMessageContent: (content: string) => void;
}

export const useGeoStore = create<GeoStore>((set) => ({
    geoInfo: null,
    setGeoInfo: (info) => set({ geoInfo: info }),
    messageId: null,
    setMessageId: (id) => set({ messageId: id }),
    messageContent: '',
    setMessageContent: (content) => set({ messageContent: content })
}));
