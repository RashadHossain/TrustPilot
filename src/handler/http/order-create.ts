import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {shopifyVerify} from 'src/validation/shopify/shopify-verify';
import {createTrustPilotClient} from "src/service/trustpilot/trustpilot";
import {createGoogleSheetsClient} from "src/service/googleapis/sheets";
import {SSM, AddTagsToResourceCommand} from "@aws-sdk/client-ssm";
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
        const {order_number, customer, created_at} = notification;
        const trustPilotClient = await createTrustPilotClient();

        const params = {
            "referenceId": order_number,
            "email": customer.email,
            "name": `${customer.first_name} ${customer.last_name}`,
            "locale": 'en-US'
        }
        const response = await trustPilotClient.createInvitation(params);

        if(response?.data) {
            console.log(`Response invitation ${response.data.url}`);
            const sheetClient = await createGoogleSheetsClient();
            const addResponse = await sheetClient.googleSheetsAdd(customer.email, order_number, response.data.url, created_at);


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
