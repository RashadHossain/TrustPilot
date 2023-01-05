import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

export async function googleSheetsAdd(email: string, order_id: string, link: string ) {
    try {
        const {
            GOOGLE_AUTH_PRIVATE_KEY,
            GOOGLE_AUTH_CLIENT_EMAIL
        } = process.env;

        const client = new JWT({
            email: GOOGLE_AUTH_CLIENT_EMAIL,
            key: GOOGLE_AUTH_PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        await client.authorize();
        const sheets = google.sheets({version: 'v4'});

        const requestBody = {
            values: [[email, order_id, link]],
        };
        const request = {
            spreadsheetId:'13g9WbmbHwsmbNXFdyClMToQCvDg_mxMSfntsnQZF4lQ',
            range: 'Sheet1',
            insertDataOption: 'INSERT_ROWS',
            valueInputOption: 'USER_ENTERED',
            resource: requestBody,
            auth: client
        };
        await sheets.spreadsheets.values.append(request);
    } catch (error: any) {
        console.error(`googleSheetsAdd error: ${error}`);
    }
}