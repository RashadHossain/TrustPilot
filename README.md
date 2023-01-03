# Ryzeup Serverless
This is Serverless project for Ryzesuperfoods.com. 

## Development

- you need to have AWS, Shopify and Google credentials set locally.

## Testing

### Unit tests

Run npm run test

## Deployment

Use [serverless](https://serverless.com) framework to manage deployments to AWS.

## Lambda order-create 

Lambda is triggered by Shopify Webhook Notification. It creates TrustPilot Invitation link, which next is shared to google sheets.