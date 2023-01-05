# Ryzeup Serverless
This is Serverless project for Ryzesuperfoods.com. 

## Development

You need to have AWS, Shopify, Trustpilot and Google credentials set locally. 
Please check .env.sample as example of how you can create .env file for local testing

### Unit tests

Run npm run test

## Deployment

Make sure that AWS parameter store has all required parameters set.
Use [serverless](https://serverless.com) framework to manage deployments to AWS.

## Lambda order-create 

Lambda is triggered by Shopify Webhook Notification. It creates TrustPilot Invitation link, afterwards it's shared to google sheet.