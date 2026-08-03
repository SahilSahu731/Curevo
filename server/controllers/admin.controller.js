import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import Appointment from "../models/appointment.model.js";
import Feedback from "../models/feedback.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import { revokeUserSessions } from "../utils/session.js";

// ... (existing imports)

export const getDashboardStats = async (req, res) => {
    // ... (existing logic)
    try {
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments();
        const totalClinics = await Clinic.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const pendingVerifications = await Doctor.countDocuments({ 'verification.status': 'pending' });
        const verifiedDoctors = await Doctor.countDocuments({ 'verification.status': 'approved' });
        const openFeedback = await Feedback.countDocuments({ status: { $in: ['open', 'in-review'] } });

        const today = new Date();
        today.setHours(0,0,0,0);
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 6);
        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: today }
        });

        const appointmentsByStatus = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const usageByDay = await Appointment.aggregate([
            { $match: { createdAt: { $gte: weekStart } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const recentFeedback = await Feedback.find({})
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(5);
        const pendingDoctors = await Doctor.find({ 'verification.status': 'pending' })
            .populate('userId', 'name email profileImage')
            .populate('clinicId', 'name')
            .sort({ 'verification.submittedAt': 1 })
            .limit(5);

        res.status(200).json({
            success: true,
            stats: {
                patients: totalPatients,
                doctors: totalDoctors,
                clinics: totalClinics,
                totalAppointments,
                todayAppointments,
                pendingVerifications,
                verifiedDoctors,
                openFeedback,
                appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                usageByDay
            },
            recentFeedback,
            pendingDoctors
        });

    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getDoctorVerifications = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const query = status === 'all' ? {} : { 'verification.status': status };
        const doctors = await Doctor.find(query)
            .populate('userId', 'name email profileImage phone')
            .populate('clinicId', 'name address city')
            .populate('verification.reviewedBy', 'name email')
            .sort({ 'verification.submittedAt': -1 });

        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const reviewDoctorVerification = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

        doctor.verification.status = status;
        doctor.verification.notes = notes;
        doctor.verification.reviewedAt = Date.now();
        doctor.verification.reviewedBy = req.user.id;
        if (status === 'approved') {
            doctor.isAvailable = true;
        }
        await doctor.save();

        const populated = await Doctor.findById(doctor._id)
            .populate('userId', 'name email profileImage phone')
            .populate('clinicId', 'name address city');

        res.status(200).json({
            success: true,
            message: `Doctor verification ${status}`,
            data: populated
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Server Error" });
    }
};

export const downloadDoctorLicense = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .select('+verification.licenseFilePublicId +verification.licenseFileResourceType +verification.licenseFileFormat');
        if (!doctor?.verification?.licenseFilePublicId) {
            return res.status(404).json({ success: false, error: "Private license file not found" });
        }
        const cloudinary = (await import('../config/cloudinary.js')).default;
        const url = cloudinary.utils.private_download_url(
            doctor.verification.licenseFilePublicId,
            doctor.verification.licenseFileFormat,
            {
                resource_type: doctor.verification.licenseFileResourceType || 'image',
                type: 'authenticated',
                expires_at: Math.floor(Date.now() / 1000) + 300,
            },
        );
        res.set('Cache-Control', 'no-store');
        return res.redirect(302, url);
    } catch (error) {
        return res.status(500).json({ success: false, error: "License download failed" });
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
        const allowed = ['name', 'phone', 'address', 'gender', 'dateOfBirth', 'bio', 'role', 'status'];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
        const previous = await User.findById(id).select('role status');
        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        if (previous.role !== user.role || previous.status !== user.status) {
            await revokeUserSessions(user._id, previous.role !== user.role ? 'role-change' : 'account-status-change');
            const { disconnectUserSessions } = await import('../config/socket.js');
            disconnectUserSessions(user._id.toString());
            await writeAuditEvent(req, previous.role !== user.role ? 'role-change' : 'account-status-change', 'success', {
                targetUserId: user._id,
                metadata: { from: previous.role !== user.role ? previous.role : previous.status, to: previous.role !== user.role ? user.role : user.status },
            });
        }
        res.status(409).json({
            success: false,
            error: "Direct admin deletion is disabled because it can orphan health records. Use the approved privacy deletion workflow.",
        });
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
        res.status(500).json({ success: false, error: "Server Error" });
    }
};
