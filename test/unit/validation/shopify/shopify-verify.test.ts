import { shopifyVerify } from '../../../../src/validation/shopify/shopify-verify'
import event from './assets/order-create.json';

describe('shopifyVerify', () => {
    it('should return true if the event is verified', async () => {
        process.env.SHOPIFY_SECRET = 'secret';
        const verified = await shopifyVerify(event);
        expect(verified).toBe(true);
    });

    it('should return false if the event is not verified', async () => {
        process.env.SHOPIFY_SECRET = 'incorrect_secret';
        const verified = await shopifyVerify(event);
        expect(verified).toBe(false);
    });

});