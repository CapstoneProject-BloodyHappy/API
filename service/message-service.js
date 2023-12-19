class MessageService {
    constructor(firebase, io) {
        this._firebase = firebase;
        this._io = io;
    }

    async getChatsByPredictionId(req, res) {
        try {
            const chats = await this._firebase.getChatsByPredictionId(req.params.id);
            return chats;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MessageService;