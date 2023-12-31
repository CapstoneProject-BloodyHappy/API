var admin = require("firebase-admin");
const { Firestore } = require('@google-cloud/firestore');
require('dotenv').config();


class FireBase {
    constructor() {
        const firebaseConfig = {
            projectId: process.env.project_id,
            client_email: process.env.client_email_firebase,
            private_key: process.env.private_key_firebase.replace(/\\n/g, '\n'),
            credentials: {
                client_email: process.env.client_email_firebase,
                private_key: process.env.private_key_firebase.replace(/\\n/g, '\n'),
            },
        };
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
        this._firestore = new Firestore(firebaseConfig)
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
        const user = await this._firestore.collection('users').where('uid', '==', snapshot.data().uid).get();
        const data = snapshot.data();
        data.user = user.docs[0].data();
        return { id: snapshot.id, ...data, ...data.user };
    }

    getPredictionsByUid = async (uid) => {
        const snapshot = await this._firestore.collection('predictions').where('uid', '==', uid).orderBy('date', 'desc').get();
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

    getDoctors = async () => {
        const snapshot = await this._firestore.collection('users').where('role', '==', 'doctor').get();
        return snapshot.docs.map(doc => doc.data());
    
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

    getAppointments = async (uid) => {
        const snapshot = await this._firestore.collection('consultations').where('clientUid', '==', uid).orderBy("clientUid", "asc").get();
        const appointments = [];
    
        const fetchUserPromises = snapshot.docs.map(async (doc) => {
            const appointmentData = doc.data();

            const clientUid = appointmentData.clientUid;

            const userSnapshot = await this._firestore.collection('users').where('uid', '==', clientUid).get();
            const userData = userSnapshot ? userSnapshot.docs[0].data() : null;

            const mergedData = {
                appointment: {
                    id: doc.id,
                    ...appointmentData
                },
                user: userData
            };

            appointments.push(mergedData);
        });

        await Promise.all(fetchUserPromises);

        return appointments;
    }

    getUserAppointments = async (uid) => {
        const snapshot = await this._firestore.collection('consultations').where('doctorUid', '==', uid).orderBy("clientUid", "asc").get();
        const appointments = [];
    
        const fetchUserPromises = snapshot.docs.map(async (doc) => {
            const appointmentData = doc.data();

            const doctorUid = appointmentData.doctorUid;

            const userSnapshot = await this._firestore.collection('users').where('uid', '==', doctorUid).get();
            const userData = userSnapshot ? userSnapshot.docs[0].data() : null;

            const mergedData = {
                appointment: {
                    id: doc.id,
                    ...appointmentData
                },
                doctor: userData
            };

            appointments.push(mergedData);
        });

        await Promise.all(fetchUserPromises);

        return appointments;
    }

    makeAppointment = async (appointment) => {
        try {
            await this._firestore.collection('consultations').add(appointment);
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to make appointment',
                log: error
            }
        }
    }

    changeAppointmentStatus = async (params) => {
        try {
            await this._firestore.collection('consultations').doc(params.consultationid).update({ status: params.status });
        }
        catch (error) {
            console.error(error);
            throw {
                status: 500,
                message: 'Failed to change appointment status',
                log: error
            }
        }
    }
}

module.exports = FireBase;