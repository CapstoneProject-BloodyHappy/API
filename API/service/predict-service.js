const tf = require('@tensorflow/tfjs');

const anemiaDesc = 'Sehubungan dengan temuan ini, sangat disarankan untuk segera berkonsultasi dengan profesional kesehatan guna melakukan pemeriksaan lebih lanjut, seperti pemeriksaan darah lengkap dan penilaian klinis. Diagnosis yang tepat dan pengelolaan anemia yang dini dapat membantu meningkatkan kesehatan dan kualitas hidup pasien.';
const nonAnemiaDesc = 'Sehubungan dengan temuan ini, tidak perlu dilakukan tindakan lebih lanjut. Namun, jika Anda memiliki keluhan lain, sangat disarankan untuk segera berkonsultasi dengan profesional kesehatan guna melakukan pemeriksaan lebih lanjut.';

class PredictService {
    constructor(cloudStorage, predictionAPI, firebase) {
        this._cloudStorage = cloudStorage;
        this._predictionAPI = predictionAPI;
        this._firebase = firebase;
    }

    async predict(req, res) {
        let fileUrl = await this._cloudStorage.uploadPhoto(req.file, 'photo');
        let predictResult = await this._predictionAPI.getPrediction(fileUrl);
        let newPrediction = {
            photoUrl: fileUrl,
            uid: req.uid,
            date: new Date().toISOString(),
            result: predictResult.prediction,
            recommendation: predictResult.prediction === 'Anemia' ? anemiaDesc : nonAnemiaDesc
        }
        await this._firebase.savePrediction(newPrediction);
        return newPrediction;
    }
}

module.exports = PredictService;