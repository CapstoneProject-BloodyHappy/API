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

    getUid = async () => {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken.uid;
        // return 'Q1ShNyf7bJcfKLp8d2yf25jqucH3'; // Testing purposes'
    }

    authenticateNewFirebaseUser = async (req, res, next) => {
        const idToken = req.header('Authorization');

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.uid = decodedToken.uid;
            // req.uid = 'Q1ShNyf7bJcfKLp8d2yf25jqucH2'; // Testing purposes'

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Unauthorized' });
        }
    };

    authenticateFirebaseUser = async (req, res, next) => {
        const idToken = req.header('Authorization');
    
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.uid = decodedToken.uid;
            // req.uid = 'Q1ShNyf7bJcfKLp8d2yf25jqucH3'; // Testing purposes'

            const isUidExist = await this.isUidExist(req.uid);

            if (!isUidExist) {
                res.status(403).json({ response: 'New User Login, Initialize User First' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Unauthorized' });
        }
    };


    savePrediction = async (prediction) => {
        const docRef = this._firestore.collection('predictions').doc();
        await docRef.set(prediction);
    }

    getPredictions = async () => {
        const snapshot = await this._firestore.collection('predictions').get();
        return snapshot.docs.map(doc => doc.data());
    }

    getPrediction = async (id) => {
        const snapshot = await this._firestore.collection('predictions').doc(id).get();
        return snapshot.data();
    }

    getPredictionsByUid = async (uid) => {
        const snapshot = await this._firestore.collection('predictions').where('uid', '==', uid).get();
        return snapshot.docs.map(doc => doc.data());
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
        await this._firestore.collection('users').add(user);
    }
}

module.exports = FireBase;