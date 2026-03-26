import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = '8746446713:AAGwlsDJVHOrVDg0HRWzm1hAQn363st0530';
const CHAT_ID = '-5224570279';

const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = await request.json();
        const { message, message_id } = body;

        if (!message) {
            return NextResponse.json({ error: 'Thiếu tham số message' }, { status: 400 });
        }

        if (message_id) {
            try {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        message_id: message_id
                    })
                });
            } catch {}
        }

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return new NextResponse(null, { status: 500 });
        }

        return NextResponse.json({
            message_id: data.result.message_id
        });
    } catch {
        return new NextResponse(null, { status: 500 });
    }
};
export { POST };
