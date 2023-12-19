class AppointmentService {
    constructor(firebase){
        this._firebase = firebase;
    }

    async getAppointments(req, res){
        try{
            const doctors = await this._firebase.getAppointments(req.uid);
            return doctors;
        }
        catch(error){
            throw error;
        }
    }

    async makeAppointment(req, res){
        try{
            const params = {
                clientUid : req.uid,
                doctorUid : req.body.doctorUid,
                predictionid : req.body.predictionid,
                status : 'pending'
            }
            const appointment = await this._firebase.makeAppointment(params);
            return appointment;
        }
        catch(error){
            throw error;
        }
    }

    async changeAppointmentStatus(req, res){
        try{
            const appointment = await this._firebase.changeAppointmentStatus(req.body);
            return appointment;
        }
        catch(error){
            throw error;
        }
    }
}

module.exports = AppointmentService;