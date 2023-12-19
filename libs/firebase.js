var admin = require("firebase-admin");
const { Firestore } = require('@google-cloud/firestore');

class FireBase {
    constructor() {
        this._serviceAccount = require("../firebase-adminsdk.json");
        admin.initializeApp({
            credential: admin.credential.cert(this._serviceAccount),
        });

        let keyFilename = 'firebase-adminsdk.json'
        this._firestore = new Firestore({ keyFilename });
    }

    isUidExist = async (uid) => {
        const snapshot = await this._firestore.collection('users').where('uid', '==', uid).get();
        return snapshot.docs.length > 0;
    }

    getUid = async (idToken) => {
        const decodedToken = await admin.auth().verifyIdToken(idToken);  // Prod
        return decodedToken.uid;                                         // Prod
    }

    authenticateNewFirebaseUser = async (req, res, next) => {
        const idToken = req.header('Authorization');
        try {
            const decodedToken = await this.getUid(idToken);

            req.uid = decodedToken;

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };

    authenticateFirebaseUser = async (req, res, next) => {
        const idToken = req.header('Authorization');

        try {
            const decodedToken = await this.getUid(idToken);

            req.uid = decodedToken;
            
            const isUidExisted = await this.isUidExist(decodedToken);
            if (!isUidExisted) {
                return res.status(403).json({ response: 'New User Login, Initialize User First' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };

    authenticateFirebaseUserForSocket = async (socket, next) => {
        const idToken = socket.handshake.headers['authorization'];
    
        try {
            const decodedToken = await this.getUid(idToken);

            const isUidExist = await this.isUidExist(decodedToken);

            if (!isUidExist) {
                next(new Error('New User Login, Initialize User First'));
            }

            next();
        } catch (error) {
            console.error(error);
            next(new Error('Unauthorized'));
        }
    };


    savePrediction = async (prediction) => {
        try {
            const docRef = this._firestore.collection('predictions').doc();
            await docRef.set(prediction);
            return docRef.id;
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to save prediction',
                log: error
            }
        }
    }

    getPredictions = async () => {
        try{
            const snapshot = await this._firestore.collection('predictions').get();
            return snapshot.docs.map(doc => doc.data());
        }
        catch(error){
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to get predictions',
                log: error
            }
        }
    }

    getPrediction = async (id) => {
        const snapshot = await this._firestore.collection('predictions').doc(id).get();
        const data = snapshot.data();
        return { id: snapshot.id, ...data };
    }

    getPredictionsByUid = async (uid) => {
        const snapshot = await this._firestore.collection('predictions').where('uid', '==', uid).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    deletePrediction = async (id) => {
        await this._firestore.collection('predictions').doc(id).delete();
    }

    updateUser = async (uid, profile) => {
        const snapshot = await this._firestore.collection('users').where('uid', '==', uid).get();
        const docId = snapshot.docs[0].id;
        await this._firestore.collection('users').doc(docId).update(profile);
    }

    getUser = async (uid) => {
        const snapshot = await this._firestore.collection('users').where('uid', '==', uid).get();
        return snapshot.docs[0].data();
    }

    createUser = async (user) => {
        try {
            await this._firestore.collection('users').add(user);
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to create user',
                log: error
            }
        }
    }

    editProfile = async (uid, profile) => {
        const snapshot = await this._firestore.collection('users').where('uid', '==', uid).get();
        const docId = snapshot.docs[0].id;
        await this._firestore.collection('users').doc(docId).update(profile);
    }

    isConsultationExist = async (clientUid, doctorUid) => {
        const snapshot = await this._firestore.collection('consultations').where('clintUid', '==', clientUid).where('doctorUid', '==', doctorUid).get();
        return snapshot.docs.length > 0;
    }

    createConsultation = async (doctorUid, clientUid, predictionId) => {
        try {
            const consultation = {
                doctorUid,
                clientUid,
                predictionId
            };
            await this._firestore.collection('consultations').add(consultation);
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to create consultation',
                log: error
            }
        }
    }

    getChatsByPredictionId = async (predictionId) => {
        try {
            const snapshot = await this._firestore.collection('chats').where('predictionId', '==', predictionId).get();
            return snapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to get chats',
                log: error
            }
        }
    }

    saveMessage = async (message) => {
        try {
            await this._firestore.collection('chats').add(message);
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to save chat',
                log: error
            }
        }
    }
}

module.exports = FireBase;