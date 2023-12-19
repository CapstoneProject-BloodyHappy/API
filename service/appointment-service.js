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
}

module.exports = AppointmentService;