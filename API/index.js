
const express = require('express');
var multer = require('multer');
require('dotenv').config();

const CloudStorage = require('./libs/cloud-storage');
const PredictionAPI = require('./libs/prediction-api');
const PredictController = require('./controller/predict-controller');
const FireBase = require('./libs/firebase');

const app = express();
const port = 3000;

const cloudStorage = new CloudStorage('../gcp-service-account.json', process.env.BUCKET_NAME);
const predictionAPI = new PredictionAPI(process.env.PREDICTION_API_URL);
const fireBase = new FireBase();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(fireBase.authenticateFirebaseUser);

const predictController = new PredictController(cloudStorage, predictionAPI, fireBase);

app.post('/predict', upload.single('file'), async (req, res) => {
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
