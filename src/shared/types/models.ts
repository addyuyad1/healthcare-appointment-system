export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
}

export interface UserRecord extends User {
  password: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  role: "doctor";
  specialization: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  location: string;
  about: string;
  qualifications: string[];
  availableTimeSlots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: "scheduled" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRecord extends Appointment {
  doctorName: string;
  patientName: string;
  specialization: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
  role: UserRole;
  specialization?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BookAppointmentPayload {
  doctorId: string;
  patientId: string;
  date: string;
  timeSlot: string;
  reason: string;
}

export interface UpdateAppointmentPayload {
  date?: string;
  timeSlot?: string;
  status?: "scheduled" | "cancelled";
}

export interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  status?: "scheduled" | "cancelled";
}
