const ProfileService = require('../service/profile-service');
const AppointmentService = require('../service/appointment-service');

class AppointmentController {
    constructor(firebase) {
        this._firebase = firebase;
        this._profileService = new ProfileService(firebase);
        this._appointmentService = new AppointmentService(firebase);
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

    async getAppointments(req, res) {
        try {
            const appointments = await this._appointmentService.getAppointments(req, res);
            return res.json(appointments);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }

    async makeAppointment(req, res) {
        try {
            const appointments = await this._appointmentService.makeAppointment(req, res);
            return res.json(appointments);
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AppointmentController;
