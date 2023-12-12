const PredictService = require('../service/predict-service');

class PredictController {
    constructor(cloudStorage, predictionAPI, firebase) {
        this._cloudStorage = cloudStorage;
        this._predictionAPI = predictionAPI;
        this._firebase = firebase;
        this._predictService = new PredictService(cloudStorage, predictionAPI, firebase);
    }

    predict = async (req, res) => {
        try {
            const prediction = await this._predictService.predict(req, res);
            res.json(prediction);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    getPredictions = async (req, res) => {
        try {
            const predictions = await this._predictService.getPredictions(req, res);
            res.json(predictions);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = PredictController;