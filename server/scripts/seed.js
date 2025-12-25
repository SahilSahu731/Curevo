import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";
import Doctor from "../models/doctor.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const sampleFirstNames = ["John", "Jane", "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kelly", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Ryan", "Sarah", "Tom", "Ursula", "Victor", "Wendy", "Xander", "Yara", "Zack"];
const sampleLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const specializations = ["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine", "Psychiatry", "Ophthalmology", "Dentistry", "ENT"];
const clinicNames = ["HealthPlus", "CareFirst", "City Clinic", "Family Health", "Wellness Center", "Rapid Care", "Elite Medical", "Prime Health", "LifeCare", "Metro Clinic"];
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPhone = () => `+1${getRandomInt(1000000000, 9999999999)}`;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seed = async () => {
    await connectDB();

    try {
        console.log("Destroying existing data...");
        // Be careful not to delete your own admin account if you have one, 
        // but for a seeding request usually we wipe `patient` and `doctor` roles + all clinics.
        // Let's wipe everything for a clean slate as requested for "dummy data to test".
        await Clinic.deleteMany({});
        await Doctor.deleteMany({});
        await User.deleteMany({ role: { $in: ["patient", "doctor"] } }); 

        console.log("Data destroyed.");

        // 1. Seed 10 Clinics
        const clinics = [];
        for (let i = 0; i < 10; i++) {
            const clinicCity = getRandom(cities);
            const clinic = await Clinic.create({
                name: `${getRandom(clinicNames)} ${clinicCity} ${i+1}`,
                address: `${getRandomInt(1, 999)} Main St, ${clinicCity}`,
                city: clinicCity,
                state: "CA",
                zipCode: `${getRandomInt(10000, 99999)}`,
                description: `A premier healthcare facility in ${clinicCity} focused on providing patient-centered care.`,
                images: [
                    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
                    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600", 
                    "https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&q=80&w=600"
                ],
                services: ["General Consultation", "Pediatrics", "Cardiology", "Emergency Care"],
                phone: getRandomPhone(),
                email: `clinic${i+1}@example.com`,
                openingTime: "09:00",
                closingTime: "17:00",
                averageConsultationTime: 30,
                workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                maxPatientsPerDay: 50,
                isActive: true
            });
            clinics.push(clinic);
        }
        console.log("Seeded 10 Clinics.");

        // 2. Seed 20 Doctors
        const doctors = [];
        for (let i = 0; i < 20; i++) {
            const fName = getRandom(sampleFirstNames);
            const lName = getRandom(sampleLastNames);
            
            // Create User for Doctor
            const user = await User.create({
                name: `Dr. ${fName} ${lName}`,
                email: `doctor${i+1}@curevo.com`,
                password: "password123", // Default password
                role: "doctor",
                phone: getRandomPhone(),
                gender: getRandom(["male", "female"]),
                dateOfBirth: new Date(1980, 0, 1),
                address: {
                    street: "123 Medical Ln",
                    city: getRandom(cities),
                    state: "CA",
                    zipCode: "90001",
                    country: "USA"
                }
            });

            // Create Doctor Profile
            const doctor = await Doctor.create({
                userId: user._id,
                clinicId: getRandom(clinics)._id,
                specialization: getRandom(specializations),
                qualification: "MBBS, MD",
                experience: getRandomInt(2, 25),
                consultationFee: getRandomInt(50, 300),
                isAvailable: true
            });
            doctors.push(doctor);
        }
        console.log("Seeded 20 Doctors.");

        // 3. Seed 30 Patients
        for (let i = 0; i < 30; i++) {
            const fName = getRandom(sampleFirstNames);
            const lName = getRandom(sampleLastNames);

            await User.create({
                name: `${fName} ${lName}`,
                email: `patient${i+1}@example.com`,
                password: "password123",
                role: "patient",
                phone: getRandomPhone(),
                gender: getRandom(["male", "female"]),
                dateOfBirth: new Date(getRandomInt(1970, 2005), 0, 1),
                address: {
                    street: `${getRandomInt(100, 999)} Park Ave`,
                    city: getRandom(cities),
                    state: "NY",
                    zipCode: "10001",
                    country: "USA"
                },
                bio: "Just a dummy patient profile."
            });
        }
        console.log("Seeded 30 Patients.");

        console.log("SEEDING COMPLETED SUCCESSFULLY!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
};

seed();
