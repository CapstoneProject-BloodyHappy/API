const ProfileService = require('../service/profile-service');

class ProfileController {
    constructor(firebase, cloudStorage) {
        this._cloudStorage = cloudStorage;
        this._firebase = firebase;
        this._profileService = new ProfileService(firebase, cloudStorage);
    }

    createProfile = async (req, res) => {
        try {
            const uid = await this._firebase.getUid(req.header('Authorization'));
            const isUidExist = await this._firebase.isUidExist(uid);
    
            if (isUidExist) {
                return res.status(403).json({ response: 'User Already Exist' });
            }
            const profile = await this._profileService.createProfile(req, res);
            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(error.status).json(error || 'Internal Server Error');
        }
    }

    editProfile = async (req, res) => {
        try {    
            const profile = await this._profileService.editProfile(req, res);
            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(error.status).json(error || 'Internal Server Error');
        }
    }

    getProfile = async (req, res) => {
        try {
            const profile = await this._profileService.getProfile(req, res);
            return res.json(profile);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = ProfileController;