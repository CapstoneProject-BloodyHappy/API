
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
var multer = require('multer');
require('dotenv').config();

const CloudStorage = require('./libs/cloud-storage');
const PredictionAPI = require('./libs/prediction-api');
const FireBase = require('./libs/firebase');

const PredictController = require('./controller/predict-controller');
const ProfileController = require('./controller/profile-controller');
const MessageController = require('./controller/message-controller');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIO(server, {
    path: '/message-socket',
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const cloudStorage = new CloudStorage('../gcp-service-account.json', process.env.BUCKET_NAME);
const predictionAPI = new PredictionAPI(process.env.PREDICTION_API_URL);
const fireBase = new FireBase();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(['/profile', '/predict', '/predictionsByUID'], fireBase.authenticateFirebaseUser);
app.use('/create-user', fireBase.authenticateNewFirebaseUser);
app.use(express.json());

const predictController = new PredictController(cloudStorage, predictionAPI, fireBase);
const profileController = new ProfileController(fireBase, cloudStorage);
const messageController = new MessageController(fireBase, io);

io.use((socket, next) => fireBase.authenticateFirebaseUserForSocket(socket, next));

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('requestConsultation', (req) => {
        messageController.sendConsultationRequest(socket, req);
    });

    socket.on('message', (req) => {
        messageController.sendMessage(socket, req);
    });

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
    });
});

app.post('/create-user', async (req, res) => {
    try {
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

app.put('/profile', async (req, res) => {
    try {
        profileController.editProfile(req, res);
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

app.get('/predictionsByUID', async (req, res) => {
    try {
        predictController.getPredictions(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/predict/:id', async (req, res) => {
    try {
        predictController.getPredictionDetails(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
