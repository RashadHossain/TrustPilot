import * as crypto from 'crypto';

export const shopifyVerify = async (event: any) => {
    try {
        const secret = process.env.SHOPIFY_SECRET ?? '';
        const hmac_header = event.headers['x-shopify-hmac-sha256'] ?? '';
        const data = event.body ?? '';
        return verifyWebhook(data, hmac_header, secret)
    } catch(e: any) {
        console.log(`shopifyVerify Error: ${e}`);
        return false;
    }
};


function verifyWebhook(data: string, hmac_header: string, secret: string) {
    // Check if the hmac header is present and not empty
    if (!hmac_header || !secret) {
        return false;
    }

    // Calculate the HMAC of the request data using the shared secret
    const digest = crypto.createHmac('sha256', secret).update(data, 'utf8').digest('base64');

    // Compare the calculated HMAC to the HMAC header
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac_header));
}