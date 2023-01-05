import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {shopifyVerify} from 'src/validation/shopify/shopify-verify';
import {trustPilotClient} from "src/service/trustpilot/trustpilot";
import {googleSheetsAdd} from "src/service/googleapis/googleapis";
import * as dotenv from "dotenv";
dotenv.config();

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    try {
        if (!event.body || !event.headers['x-shopify-topic'] || event.headers['x-shopify-topic'] !== 'orders/create') {
            return {
                statusCode: 400,
                body: JSON.stringify(
                    {
                        message: "Notification is not valid."
                    },
                    null,
                    2
                ),
            };
        }
        const isShopifyEvent = await shopifyVerify(event);
        console.log(`was verified ${isShopifyEvent}`)
        if (!isShopifyEvent) {
            return {
                statusCode: 400,
                body: JSON.stringify(
                    {
                        message: "Notification was not verified."
                    },
                    null,
                    2
                ),
            }
        }

        const notification = JSON.parse(event.body);
        const {order_number, customer} = notification;
        const client = await trustPilotClient();

        const params = {
            "referenceId": order_number,
            "email": customer.email,
            "name": `${customer.first_name} ${customer.last_name}`,
            "locale": 'en-US'
        }
        const response = await client.createInvitation(params);

        if(response?.data) {
            console.log(`Response invitation ${response.data.url}`);
            await googleSheetsAdd(customer.email, order_number, response.data.url);
        }

    } catch (e) {
        console.log(e);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: "Request received"
            },
            null,
            2
        ),
    };
};
