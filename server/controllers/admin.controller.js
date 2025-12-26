import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import Appointment from "../models/appointment.model.js";

// ... (existing imports)

export const getDashboardStats = async (req, res) => {
    // ... (existing logic)
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Prevent password update via this route for simplicity, or handle hashing if needed.
        // For now, let's exclude password updates here.
        delete updates.password;

        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        
        // Optional: Cleanup related data (Appointments, Doctor profile if any)
        
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getUserAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const appointments = await Appointment.find({ patientId: id })
            .populate('doctorId', 'userId')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('clinicId', 'name address')
            .sort({ date: -1 });

        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, date } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (date) {
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('clinicId', 'name')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            count,
            data: appointments
        });
    } catch (error) {
        console.error("Admin All Appointments Error:", error);
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
