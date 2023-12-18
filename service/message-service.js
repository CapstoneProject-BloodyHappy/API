class MessageService {
    constructor() {
        this.messages = [];
    }

    add(message) {
        this.messages.push(message);
    }

    get() {
        return this.messages;
    }
}

module.exports = MessageService;