import '@/app/globals.css';
import Favicon from '@/assets/images/favicon.png';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meta Verified – Rewards for you',
    icons: {
        icon: Favicon.src
    }
};

const RootLayout = ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang='en'>
            <body className={`font-body antialiased`}>{children}</body>
        </html>
    );
};
export default RootLayout;
