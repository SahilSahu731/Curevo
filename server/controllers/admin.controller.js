import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import Appointment from "../models/appointment.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments();
        const totalClinics = await Clinic.countDocuments();
        const totalAppointments = await Appointment.countDocuments();

        const today = new Date();
        today.setHours(0,0,0,0);
        const todayAppointments = await Appointment.countDocuments({
            date: today
        });

        res.status(200).json({
            success: true,
            stats: {
                patients: totalPatients,
                doctors: totalDoctors,
                clinics: totalClinics,
                totalAppointments,
                todayAppointments
            }
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
