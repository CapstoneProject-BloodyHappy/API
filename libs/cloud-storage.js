const {Storage} = require('@google-cloud/storage');
const path = require('path');

class cloudStorage {
    constructor(keyPath, bucketName) {
        const keyFilename = path.join(__dirname, keyPath);
        this._storage = new Storage({
            projectId: process.env.project_id,
            credentials: {
                client_email: process.env.client_email_service_account,
                private_key: process.env.private_key_service_account.replace(/\\n/g, '\n'),
            },
        });
        this._bucketName = bucketName;

        this._bucket = this._storage.bucket(this._bucketName);
    }

    generateRandomName = () => {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);

        const randomName = `photo_${timestamp}_${randomString}`;
        return randomName;
    }


    uploadPhoto = async (file, folder) => {
        try{
            return new Promise((resolve, reject) => {
                const { buffer } = file;
                const blob = this._bucket.file(`${folder}/${this.generateRandomName().replace(/ /g, "_")}`);
                const blobStream = blob.createWriteStream({
                    resumable: false
                });
    
                blobStream.on('finish', () => {
                    const publicUrl = `https://storage.googleapis.com/${this._bucket.name}/${blob.name}`;
                    resolve(publicUrl);
                }).on('error', (err) => {
                    reject(`Unable to upload image, something went wrong`);
                }).end(buffer);
            });
        }
        catch(error){
            console.error(error);
            throw {
                status: 500,
                error: "Failed to upload photo"
            };
        };
    }
}

module.exports = cloudStorage;