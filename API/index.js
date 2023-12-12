
const express = require('express');
var multer = require('multer');
require('dotenv').config();

const CloudStorage = require('./libs/cloud-storage');
const PredictionAPI = require('./libs/prediction-api');
const FireBase = require('./libs/firebase');

const PredictController = require('./controller/predict-controller');
const ProfileController = require('./controller/profile-controller');

const app = express();
const port = 3000;

const cloudStorage = new CloudStorage('../gcp-service-account.json', process.env.BUCKET_NAME);
const predictionAPI = new PredictionAPI(process.env.PREDICTION_API_URL);
const fireBase = new FireBase();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(['/profile', '/predict'], fireBase.authenticateFirebaseUser);
app.use('/create-user', fireBase.authenticateNewFirebaseUser);

const predictController = new PredictController(cloudStorage, predictionAPI, fireBase);
const profileController = new ProfileController(fireBase, cloudStorage);

app.post('/create-user', async (req, res) => {
    try {
        const uid = await fireBase.getUid();
        const isUidExist = await fireBase.isUidExist(uid);

        if (isUidExist) {
            res.status(403).json({ response: 'User Already Exist' });
        }

        profileController.createProfile(req, res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', async (req, res) => {
    try {
        profileController.getProfile(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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
