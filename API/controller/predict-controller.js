const PredictService = require('../service/predict-service');

class PredictController {
    constructor(cloudStorage) {
        this._cloudStorage = cloudStorage;
        this._predictService = new PredictService(cloudStorage);
    }

    async predict(req, res) {
        try {
            const model = await this._predictService.predict(req, res);
            res.json({ model });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = PredictController;