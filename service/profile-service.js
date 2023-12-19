class ProfileService {
    constructor(firebase, cloudStorage) {
        this._firebase = firebase;
        this._cloudStorage = cloudStorage;
    }

    createProfile = async (req, res) => {
        try{
            const uid = req.uid;
            console.log(req.body)
            const { name, email, age, sex } = req.body;
            if (!name || !email || !age || !sex){
                throw{
                    status: 400,
                    error: "Missing required fields"
                }
            }
            const profile = {
                name,
                email,
                age,
                sex,
                uid
            };
            await this._firebase.createUser(profile);
            return profile;
        }
        catch(error){
            throw error
        }
    }

    editProfile = async (req, res) => {
        try{
            const uid = req.uid;
            const { name, email, age, sex } = req.body;
            if (!req.body) {
                throw {
                    status: 400,
                    error: "Missing required fields"
                }
            }
            await this._firebase.editProfile(uid, req.body);
            return await this._firebase.getUser(uid);
        }
        catch(error){
            throw error
        }
    }

    getProfile = async (req, res) => {
        return await this._firebase.getUser(req.uid);
    }
}

module.exports = ProfileService;