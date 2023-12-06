const {Storage} = require('@google-cloud/storage');
const path = require('path');

class cloudStorage {
    constructor(keyPath, bucketName) {
        const keyFilename = path.join(__dirname, keyPath);
        this._storage = new Storage({ keyFilename });
        this._bucketName = bucketName;

        this._bucket = this._storage.bucket(this._bucketName);
    }

    async getModelUrl() {
        return this._storage
            .bucket(this._bucketName)
            .file(process.env.MODEL_PATH)
            .getSignedUrl({
                action: 'read',
                expires: Date.now() + 1000 * 60 * 60 * 24 * 7
            })
            .then(signedUrls => {
                return signedUrls[0];
            })
            .catch(err => {
                console.error(err);
            });
        
    }

    uploadPhoto(file) {
        return new Promise((resolve, reject) => {
            const { originalname, buffer } = file;
            const blob = this._bucket.file(originalname.replace(/ /g, "_"));
            const blobStream = blob.createWriteStream({
                resumable: false
            });

            blobStream.on('finish', () => {
                const publicUrl = `https://storage.googleapis.com/${this._bucket.name}/photo/${blob.name}`;
                resolve(publicUrl);
            }).on('error', (err) => {
                reject(`Unable to upload image, something went wrong`);
            }).end(buffer);
        });
    }
}

module.exports = cloudStorage;