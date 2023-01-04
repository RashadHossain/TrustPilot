import axios from 'axios';
import qs from 'qs';
import { TrustPilotClientConfiguration } from '../../types/trustpilot';

class TrustPilotClient {
    private readonly baseUrl: string;
    private readonly invitationsUrl: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly businessUnitId: string;
    private readonly redirectUri: string;
    private accessToken: string;

    constructor(config: TrustPilotClientConfiguration) {
        this.baseUrl = config.baseUrl;
        this.invitationsUrl = config.invitationsUrl;
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
        this.businessUnitId = config.businessUnitId;
        this.redirectUri = config.redirectUri;
        this.accessToken = '';
    }

    async authenticate(){
        try {
            const data = {
                grant_type: 'client_credentials'
            }
            const response = await axios.post(
                `${this.baseUrl}/v1/oauth/oauth-business-users-for-applications/accesstoken`,
                qs.stringify(data),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    auth: {
                        username: this.apiKey,
                        password: this.apiSecret
                    }
                }
            );
            if(!response?.data?.access_token) {
                console.log('No access Token granted');
            }
            this.accessToken = response.data.access_token;
        } catch (error: any) {
            console.error(`authenticate error: ${error}`);
        }

        return this;
    };

    async createInvitation(params: any){
        try {
            const data = {
                "referenceId": params.referenceId,
                "email": params.email,
                "name": params.name,
                "locale": params.locale,
                "redirectUri": this.redirectUri
            }

            return await axios.post(
                `${this.invitationsUrl}/v1/private/business-units/${this.businessUnitId}/invitation-links`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    },

                }
            );

        } catch (error: any) {
            console.error(`createInvitation error: ${error}`);
        }
    };
}

 export async function trustPilotClient() {
    const {
        TRUSTPILOT_API_KEY,
        TRUSTPILOT_SECRET,
        TRUSTPILOT_BUSINESS_UNIT_ID,
        TRUSTPILOT_BASE_URL,
        TRUSTPILOT_INVITATIONS_URL,
        TRUSTPILOT_REDIRECT_URI
    } = process.env;

    const config = {
        'apiKey': TRUSTPILOT_API_KEY ?? '',
        'apiSecret': TRUSTPILOT_SECRET ?? '',
        'businessUnitId': TRUSTPILOT_BUSINESS_UNIT_ID ?? '',
        'baseUrl': TRUSTPILOT_BASE_URL ?? '',
        'invitationsUrl': TRUSTPILOT_INVITATIONS_URL ?? '',
        'redirectUri': TRUSTPILOT_REDIRECT_URI ?? ''
    }
    return await new TrustPilotClient(config).authenticate();
}

