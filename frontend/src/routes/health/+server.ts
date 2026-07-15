import { json } from '@sveltejs/kit';

export async function GET() {
    return json({
        success: true,
        message: 'Server is running!'
    });
}