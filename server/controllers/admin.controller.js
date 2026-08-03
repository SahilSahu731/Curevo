import User from "../models/user.model.js";
import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import Appointment from "../models/appointment.model.js";
import Feedback from "../models/feedback.model.js";
import { writeAuditEvent } from "../utils/audit.js";
import { revokeUserSessions } from "../utils/session.js";
import { notifyUser } from "../services/notification.service.js";
import { localDayRangeUtc } from "../utils/scheduling.js";

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
        const { status, notes, reason, expiresAt } = req.body;
        const doctor = await Doctor.findById(req.params.id).select('+verification.licenseFilePublicId +verification.history').populate('clinicId', 'isActive');
        if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

        const previousStatus = doctor.verification?.status || "not-submitted";
        if (previousStatus !== "pending") return res.status(409).json({ success: false, error: "Only pending submissions can be reviewed" });
        if (status === "approved" && (!doctor.verification?.licenseFilePublicId || !doctor.specialization || !doctor.qualification || !doctor.clinicId?.isActive)) {
            return res.status(409).json({ success: false, error: "Profile, active clinic, and a private license document are required for approval" });
        }

        doctor.verification.status = status;
        doctor.verification.notes = notes;
        doctor.verification.rejectionReason = status === "rejected" ? reason : "";
        doctor.verification.reviewedAt = Date.now();
        doctor.verification.reviewedBy = req.user.id;
        doctor.verification.expiresAt = status === "approved" ? (expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60_000)) : undefined;
        doctor.verification.history.push({ from: previousStatus, to: status, reason, actorUserId: req.user._id, changedAt: new Date() });
        if (status === 'approved') {
            doctor.isAvailable = true;
        } else {
            doctor.isAvailable = false;
        }
        await doctor.save();
        await writeAuditEvent(req, "doctor-verification-reviewed", "success", {
            targetUserId: doctor.userId,
            metadata: { doctorId: doctor._id.toString(), previousStatus, status, reason },
        });
        await notifyUser({
            userId: doctor.userId,
            dedupKey: `verification:${doctor._id}:${doctor.verification.reviewedAt.toISOString()}`,
            message: status === "approved" ? "Your clinician verification was approved. Review your availability before accepting appointments." : "Your clinician verification needs changes. Open your profile to review the reason and resubmit.",
            safeLink: "/profile",
        });

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
        const reason = String(req.get('x-break-glass-reason') || '').trim();
        if (reason.length < 10) return res.status(400).json({ success: false, error: "A support reason is required to access a license document" });
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
        await writeAuditEvent(req, 'license-download', 'success', { metadata: { doctorId: doctor._id.toString(), reasonLength: reason.length } });
        res.set('Cache-Control', 'no-store');
        return res.redirect(302, url);
    } catch (error) {
        return res.status(500).json({ success: false, error: "License download failed" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page, limit, search, role, status, sortBy, sortOrder } = req.query;
        const query = {};
        if (role !== 'all') query.role = role;
        if (status !== 'all') query.status = status;
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = mongoose.trusted([
                { name: mongoose.trusted({ $regex: escaped, $options: 'i' }) },
                { email: mongoose.trusted({ $regex: escaped, $options: 'i' }) },
            ]);
        }
        const [users, count] = await Promise.all([
            User.find(query).setOptions({ sanitizeFilter: false }).select('-password').sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
            User.countDocuments(query).setOptions({ sanitizeFilter: false }),
        ]);
        res.status(200).json({ success: true, count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)), data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['name', 'phone', 'role', 'status'];
        const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
        const previous = await User.findById(id).select('name email role status');
        if (!previous) return res.status(404).json({ success: false, error: "User not found" });
        if (previous.email !== req.body.targetEmail) return res.status(400).json({ success: false, error: "Target email does not match" });
        const changingOwnAccess = previous._id.equals(req.user._id) && (updates.role && updates.role !== previous.role || updates.status === 'suspended');
        if (changingOwnAccess) return res.status(409).json({ success: false, error: "You cannot remove or suspend your own administrator access" });
        if (previous.role === 'admin' && (updates.role && updates.role !== 'admin' || updates.status === 'suspended')) {
            const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
            if (activeAdmins <= 1) return res.status(409).json({ success: false, error: "The last active administrator cannot be removed or suspended" });
        }
        if (updates.role !== undefined && updates.role !== previous.role) updates.adminScope = updates.role === 'admin' ? 'operations' : undefined;
        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        if (updates.status === 'suspended') {
            await revokeUserSessions(user._id, "admin-suspension");
            const { disconnectUserSessions } = await import('../config/socket.js');
            disconnectUserSessions(user._id.toString());
        }
        await writeAuditEvent(req, 'admin-user-update', 'success', {
            targetUserId: user._id,
            metadata: { fields: Object.keys(updates), previousRole: previous.role, nextRole: user.role, previousStatus: previous.status, nextStatus: user.status, reason: req.body.reason },
        });

        res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });
        if (user.email !== req.body.targetEmail) return res.status(400).json({ success: false, error: "Target email does not match" });
        if (user._id.equals(req.user._id)) return res.status(409).json({ success: false, error: "You cannot suspend your own account" });
        if (user.role === 'admin') {
            const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
            if (activeAdmins <= 1) return res.status(409).json({ success: false, error: "The last active administrator cannot be suspended" });
        }
        user.status = "suspended";
        await user.save();
        const doctor = await Doctor.findOne({ userId: user._id });
        if (doctor) { doctor.isAvailable = false; await doctor.save(); }
        await revokeUserSessions(user._id, "admin-deactivation");
        const { disconnectUserSessions } = await import('../config/socket.js');
        disconnectUserSessions(user._id.toString());
        await writeAuditEvent(req, 'account-deactivation', 'success', { targetUserId: user._id, metadata: { mode: "retained-records", reason: req.body.reason } });
        res.status(200).json({ success: true, message: "User deactivated; dependent records were retained" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getUserAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const reason = String(req.get('x-break-glass-reason') || '').trim();
        if (reason.length < 10) return res.status(400).json({ success: false, error: "A support or compliance reason is required" });
        const appointments = await Appointment.find({ patientId: id })
            .populate('doctorId', 'userId')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('clinicId', 'name address')
            .sort({ date: -1 });

        await writeAuditEvent(req, 'admin-appointment-history-access', 'success', { targetUserId: id, metadata: { reason } });
        res.status(200).json({ success: true, count: appointments.length, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, date, timezone = "Asia/Kolkata", search = "", sortBy = "slotStartUtc", sortOrder = "desc" } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (date) {
            const { start, end } = localDayRangeUtc(date, timezone);
            query.slotStartUtc = mongoose.trusted({ $gte: start, $lt: end });
        }

        if (search) {
            const escaped = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matchingUsers = await User.find({ $or: mongoose.trusted([
                { name: mongoose.trusted({ $regex: escaped, $options: 'i' }) },
                { email: mongoose.trusted({ $regex: escaped, $options: 'i' }) },
            ]) }).setOptions({ sanitizeFilter: false }).select('_id').limit(200).lean();
            query.patientId = mongoose.trusted({ $in: matchingUsers.map((item) => item._id) });
        }
        const allowedSort = new Set(['slotStartUtc', 'status', 'tokenNumber', 'createdAt']);
        const sortField = allowedSort.has(sortBy) ? sortBy : 'slotStartUtc';
        const appointments = await Appointment.find(query).setOptions({ sanitizeFilter: false })
            .populate('patientId', 'name email')
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate('clinicId', 'name')
            .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1, _id: 1 })
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
