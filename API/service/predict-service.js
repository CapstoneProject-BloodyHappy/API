const tf = require('@tensorflow/tfjs');

class PredictService {
    constructor(cloudStorage) {
        this._cloudStorage = cloudStorage;
    }

    async predict(req, res) {
        const modelUrl = await this._cloudStorage.getModelUrl();
        const model = await tf.loadLayersModel(modelUrl, { strict: false });
        // const file = this._cloudStorage.uploadPhoto(req.body.file);
        // const result = model.predict(tf.tensor2d([req.body.data]));
    }
}

module.exports = PredictService;