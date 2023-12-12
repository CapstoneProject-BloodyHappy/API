const ProfileService = require('../service/profile-service');

class ProfileController {
    constructor(firebase, cloudStorage) {
        this._cloudStorage = cloudStorage;
        this._firebase = firebase;
        this._profileService = new ProfileService(firebase, cloudStorage);
    }

    createProfile = async (req, res) => {
        try {
            const profile = await this._profileService.createProfile(req, res);
            res.json(profile);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    getProfile = async (req, res) => {
        try {
            const profile = await this._profileService.getProfile(req, res);
            res.json(profile);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = ProfileController;