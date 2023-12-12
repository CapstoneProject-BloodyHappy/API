const PredictService = require('../service/predict-service');

class PredictController {
    constructor(cloudStorage, predictionAPI, firebase) {
        this._cloudStorage = cloudStorage;
        this._predictionAPI = predictionAPI;
        this._firebase = firebase;
        this._predictService = new PredictService(cloudStorage, predictionAPI, firebase);
    }

    async predict(req, res) {
        try {
            const prediction = await this._predictService.predict(req, res);
            res.json(prediction);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = PredictController;