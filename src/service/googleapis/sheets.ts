import { JWT } from 'google-auth-library';
import { google, sheets_v4} from 'googleapis';
import {GoogleSheetsClientConfiguration} from "src/types/googleapis";
import axios from "axios/index";
import qs from "qs";

class GoogleSheetsClient {
    private readonly client: JWT;
    private readonly sheetId: string;
    private readonly sheets: any;
    private readonly defaultColumns: any;
    constructor(config: GoogleSheetsClientConfiguration) {

        this.sheetId = config.sheetId;
        this.client = new JWT({
            email: config.clientEmail,
            key: config.privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({version: 'v4'});
        this.defaultColumns = {
            values: [['Email	Order', 'Number', 'Trustpilot Invitation Link', 'Timestamp']]
        }
    }

    async authenticate() {
        try {
            await this.client.authorize();
        } catch (error: any) {
            console.error(`authenticate error: ${error}`);
        }

        return this;
    };

    async googleSheetsAdd(email: string, order_id: string, link: string, created_at: string) {
        try {
            const requestBody = {
                values: [[email, order_id, link, created_at]],
            };
            console.log(requestBody);
            return await this.googleSheetsAppend(requestBody, 'Sheet1')

        } catch (error: any) {
            console.error(`googleSheetsAdd error: ${error}`);
        }
    }

    async googleSheetsAppend(requestBody: any, range: string) {
        const request = {
            spreadsheetId: this.sheetId,
            range: range,
            insertDataOption: "OVERWRITE",
            valueInputOption: 'USER_ENTERED',
            resource: requestBody,
            auth: this.client
        };
        return await this.sheets.spreadsheets.values.append(request);
    }

    async googleSheetsUpdate(values: any, range: string) {
        try {
            const request = {
                spreadsheetId: this.sheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: { values },
                auth: this.client
            };
            return await this.sheets.spreadsheets.values.update(request);
        } catch (e) {
            console.log(`UPDATE ERROR ${e}`);
        }
    }

    async googleSheetsGetValues(sheetId: string) {
        try {
            const request = {
                spreadsheetId: this.sheetId,
                range: sheetId,
                auth: this.client
            };
            return await this.sheets.spreadsheets.values.get(request);
        } catch (error: any) {
            console.error(`googleSheetsAdd error: ${error}`);
        }
    }

    async moveDataBetweenSheets(sheetIdMigrateFrom: string, sheetIdMigrateTo: string) {
        try {
            const data = await this.googleSheetsGetValues(sheetIdMigrateFrom);
            if(data) {
                const values = data.data.values;
                await this.googleSheetsUpdate(values, sheetIdMigrateTo);
                console.log('Updated data');
                await this.googleSheetsClear(sheetIdMigrateFrom);
                await this.googleSheetsAppend(this.defaultColumns, sheetIdMigrateFrom);
            }

        } catch (error: any) {
            console.error(`googleSheetsAdd error: ${error}`);
        }
    }

    async googleSheetsClear(range: string) {
        try {
            console.log(`Clearing ${range}`);

            const sheetResponse = await this.sheets.spreadsheets.get({
                spreadsheetId: this.sheetId,
                auth: this.client,
                ranges: [], // Specify an empty array to fetch only the sheet properties, not cell values
                includeGridData: false, // Set to false to reduce response data size
            });

            const sheet = sheetResponse.data.sheets.find(
                (sheet: { properties: { title: string } }) => sheet.properties.title === range
            );
            if (!sheet) {
                console.error("Sheet not found");
                return;
            }
            const rowCount = sheet.properties.gridProperties.rowCount;



            const deleteRowsRequest = {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties.sheetId,
                                dimension: "ROWS",
                                startIndex: 1,
                                endIndex: rowCount,
                            },
                        },
                    },
                ],
            };
            const request = {
                // The spreadsheet to apply the updates to.
                spreadsheetId: this.sheetId,
                resource: deleteRowsRequest,
                auth: this.client,
            };
            const response = await this.sheets.spreadsheets.batchUpdate(request);
            console.log(response)
            console.log('success deletion')

            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.sheetId,
                range,
                auth: this.client
            });
        } catch (error: any) {
        console.error(`googleSheetsClear error: ${error}`);
    }

    }


    async getSheetPage(sheets: sheets_v4.Sheets) {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: this.sheetId,
            range: 'Sheet1',
        });
        console.log(res);
    } catch (error: any) {
        console.error(`googleSheetsAdd error: ${error}`);
    }


}

export async function createGoogleSheetsClient() {
    const {
        GOOGLE_AUTH_PRIVATE_KEY,
        GOOGLE_AUTH_CLIENT_EMAIL,
        GOOGLE_SHEET_ID
    } = process.env;

    const config = {
        'privateKey': GOOGLE_AUTH_PRIVATE_KEY ?? '',
        'clientEmail': GOOGLE_AUTH_CLIENT_EMAIL ?? '',
        'sheetId': GOOGLE_SHEET_ID ?? ''
    }

    return await new GoogleSheetsClient(config).authenticate();
}

