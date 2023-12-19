const ProfileService = require('../service/profile-service');

class AppointmentController {
    constructor(firebase, cloudStorage) {
        this._cloudStorage = cloudStorage;
        this._firebase = firebase;
        this._profileService = new ProfileService(firebase, cloudStorage);
    }

    async getDoctors(req, res) {
        try {
            const doctors = await this._profileService.getDoctors(req, res);
            return res.json(doctors);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AppointmentController;