
const express = require('express');
const CloudStorage = require('./libs/cloud-storage');
const PredictController = require('./controller/predict-controller');
require('dotenv').config();

const app = express();
const port = 3000;

const cloudStorage = new CloudStorage(process.env.CLOUD_KEY_PATH, process.env.BUCKET_NAME);

const predictController = new PredictController(cloudStorage);

app.use(express.json());

app.post('/', async (req, res) => {
    try {
        predictController.predict(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
