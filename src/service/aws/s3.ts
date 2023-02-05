import {JWT} from "google-auth-library";

const AWS = require('aws-sdk');

class S3Client{
    private readonly s3;
    private readonly bucketName;
    constructor() {
        const {
            AWS_BUCKET_API_KEY,
            AWS_BUCKET_SECRET_KEY,
            AWS_BUCKET_NAME
        } = process.env;

        this.s3 = new AWS.S3({
            accessKeyId: AWS_BUCKET_API_KEY,
            secretAccessKey: AWS_BUCKET_SECRET_KEY
        });
        this.bucketName = AWS_BUCKET_NAME;
    }

    upload(fileName: any, file: any, contentType: string) {
        const params = {
            Bucket: this.bucketName,
            Body: file,
            Key: fileName,
            ContentType: contentType
        };

        return this.s3.upload(params).promise();
    }

    async load(fileName: any) {
        const params = {
            Bucket: this.bucketName,
            Key: fileName
        };
        const data = await this.s3.getObject(params).promise();
        return data.Body.toString();
    }
}

export function createS3Client() {
    return new S3Client;
}