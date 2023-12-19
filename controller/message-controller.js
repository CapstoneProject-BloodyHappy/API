const MessageService = require('../service/message-service');

class MessageController {
    constructor(firebase, io) {
        this._firebase = firebase;
        this._io = io;
        this._messageService = new MessageService(firebase, io);
    }

    async sendConsultationRequest(socket, req) {
        try {
            if (req.message === 'client_request_doctor') {
                this._io.emit('sendRequestToAllDoctors', { sender: {uid: req.uid, socketid: socket.id}, predictionid: req.predictionid});
            } else if (req.message === 'doctor_accepted_request') {
                this._firebase.createConsultation(req.uid, req.recipient.uid, req.predictionid);
                this._io.to(req.recipient.socketid).emit('requestConsultation', { sender: {uid: req.uid, socketid: socket.id}, message: 'doctor_accepted_request', predictionid: req.predictionid });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async sendMessage(socket, req) {
        try {
            if (this._firebase.isConsultationExist(req.uid, req.recipient.uid) || this._firebase.isConsultationExist(req.recipient.uid, req.uid)) {
                // this._io.to(req.recipient.socketid).emit('message', { sender: {socketid: socket.id, uid: req.uid}, message: req.message });
                this._io.emit('updateMessage', { predictionid: req.predictionid });
                await this._firebase.saveMessage({senderUid: req.uid, predictionId: req.predictionid, message: req.message, timestamp: new Date().toISOString()});
            }
        } catch (error) {
            console.error(error);
        }
    }

    async getChatsByPredictionId(req, res) {
        try {
            const chats = await this._messageService.getChatsByPredictionId(req, res);
            return res.json(chats);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = MessageController;