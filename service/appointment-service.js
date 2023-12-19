class AppointmentService {
    constructor(firebase){
        this._firebase = firebase;
    }

    async getAppointments(req, res){
        try{
            const role = await this._firebase.getUser(req.uid);

            if (role.role === 'doctor'){
                const appointments = await this._firebase.getAppointments(req.uid);
                return appointments;
            }
            else{
                const appointments = await this._firebase.getUserAppointments(req.uid);
                return appointments;
            }
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