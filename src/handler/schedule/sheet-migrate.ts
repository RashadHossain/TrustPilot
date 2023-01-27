import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dotenv from "dotenv";
import {createGoogleSheetsClient} from "src/service/googleapis/sheets";
import {createS3Client} from "src/service/aws/s3";
import {Readable} from "stream";
dotenv.config();

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    try {
        const sheetClient = await createGoogleSheetsClient();
        const lastPageResults = await sheetClient.googleSheetsGetValues('Sheet10');
        if(lastPageResults.data.values) {
            const csvData = lastPageResults.data.values.map((row: any[]) => row.join(',')).join('\n');
            const stream = new Readable();
            const date = new Date().toJSON();
            stream.push(csvData);
            stream.push(null);

            const client = createS3Client();
            await client.upload(`trustpilot-${date}`, stream, 'text/csv')
        }

        for(let i=9;i>=1;i--) {
            await sheetClient.moveDataBetweenSheets(`Sheet${i}`, `Sheet${i+1}`)
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
