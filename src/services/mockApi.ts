import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  Appointment,
  AppointmentRecord,
  AuthResponse,
  BookAppointmentPayload,
  DoctorProfile,
  LoginPayload,
  SignupPayload,
  UpdateAppointmentPayload,
  User,
  UserRecord,
} from "../shared/types/models";

interface Database {
  users: UserRecord[];
  doctors: DoctorProfile[];
  appointments: Appointment[];
  session: {
    userId: string;
  } | null;
}

const DATABASE_KEY = "healthcare-appointment-system-db";
const DEFAULT_PASSWORD = "password123";

const seedDoctors: DoctorProfile[] = [
  {
    id: "doctor-1",
    name: "Dr. Ava Thompson",
    email: "doctor@care.com",
    role: "doctor",
    specialization: "Cardiology",
    experienceYears: 11,
    consultationFee: 140,
    rating: 4.9,
    location: "New York Medical Center",
    about:
      "Focuses on preventive cardiology, chronic heart disease care, and collaborative treatment planning.",
    qualifications: ["MD - Cardiology", "Heart Failure Specialist"],
    availableTimeSlots: ["09:00", "10:00", "11:30", "14:00", "16:00"],
  },
  {
    id: "doctor-2",
    name: "Dr. Priya Sharma",
    email: "priya@care.com",
    role: "doctor",
    specialization: "Dermatology",
    experienceYears: 8,
    consultationFee: 110,
    rating: 4.8,
    location: "Westside Skin Clinic",
    about:
      "Treats chronic skin conditions with a patient-friendly approach and a strong focus on long-term results.",
    qualifications: ["MD - Dermatology", "Cosmetic Dermatology Fellowship"],
    availableTimeSlots: ["09:30", "10:30", "13:00", "15:00", "17:00"],
  },
  {
    id: "doctor-3",
    name: "Dr. Mateo Green",
    email: "mateo@care.com",
    role: "doctor",
    specialization: "Pediatrics",
    experienceYears: 14,
    consultationFee: 95,
    rating: 4.7,
    location: "Bright Kids Health",
    about:
      "Helps families navigate preventive care, vaccinations, and everyday pediatric concerns with clarity.",
    qualifications: ["MD - Pediatrics", "Child Wellness Certification"],
    availableTimeSlots: ["08:30", "09:30", "11:00", "13:30", "15:30"],
  },
  {
    id: "doctor-4",
    name: "Dr. Emily Ross",
    email: "emily@care.com",
    role: "doctor",
    specialization: "Neurology",
    experienceYears: 9,
    consultationFee: 155,
    rating: 4.9,
    location: "Metro Neuro Clinic",
    about:
      "Works closely with patients on migraine care, neurological evaluations, and practical recovery planning.",
    qualifications: ["MD - Neurology", "Clinical Neurophysiology Training"],
    availableTimeSlots: ["10:00", "11:00", "12:00", "14:30", "16:30"],
  },
];

const seedUsers: UserRecord[] = [
  {
    id: "patient-1",
    name: "Jamie Carter",
    email: "patient@care.com",
    password: DEFAULT_PASSWORD,
    role: "patient",
    phone: "+1 (555) 203-1187",
  },
  ...seedDoctors.map<UserRecord>((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    password: DEFAULT_PASSWORD,
    role: "doctor",
    specialization: doctor.specialization,
  })),
];

const seedAppointments: Appointment[] = [
  {
    id: "appt-1",
    doctorId: "doctor-1",
    patientId: "patient-1",
    date: getRelativeDate(2),
    timeSlot: "10:00",
    reason: "Routine heart health consultation",
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "appt-2",
    doctorId: "doctor-2",
    patientId: "patient-1",
    date: getRelativeDate(5),
    timeSlot: "13:00",
    reason: "Follow-up for skin irritation",
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getRelativeDate(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0];
}

function createInitialDatabase(): Database {
  return {
    users: seedUsers,
    doctors: seedDoctors,
    appointments: seedAppointments,
    session: null,
  };
}

function readDatabase(): Database {
  const storedValue = window.localStorage.getItem(DATABASE_KEY);

  if (!storedValue) {
    const initialDatabase = createInitialDatabase();
    writeDatabase(initialDatabase);
    return initialDatabase;
  }

  try {
    return JSON.parse(storedValue) as Database;
  } catch {
    const resetDatabase = createInitialDatabase();
    writeDatabase(resetDatabase);
    return resetDatabase;
  }
}

function writeDatabase(database: Database) {
  window.localStorage.setItem(DATABASE_KEY, JSON.stringify(database));
}

function parseRequestBody<T>(payload: unknown): T {
  if (!payload) {
    return {} as T;
  }

  if (typeof payload === "string") {
    return JSON.parse(payload) as T;
  }

  return payload as T;
}

function sanitizeUser(user: UserRecord): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function buildResponse<T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T,
): AxiosResponse<T> {
  return {
    config,
    data,
    headers: {},
    status,
    statusText: String(status),
  };
}

function findUser(database: Database, userId: string) {
  return database.users.find((user) => user.id === userId);
}

function enrichAppointment(
  database: Database,
  appointment: Appointment,
): AppointmentRecord {
  const doctor = database.doctors.find((item) => item.id === appointment.doctorId);
  const patient = findUser(database, appointment.patientId);

  return {
    ...appointment,
    doctorName: doctor?.name ?? "Unknown doctor",
    patientName: patient?.name ?? "Unknown patient",
    specialization: doctor?.specialization ?? "General Medicine",
  };
}

function isSlotTaken(
  database: Database,
  payload: {
    doctorId: string;
    date: string;
    timeSlot: string;
  },
  excludedAppointmentId?: string,
) {
  return database.appointments.some(
    (appointment) =>
      appointment.id !== excludedAppointmentId &&
      appointment.doctorId === payload.doctorId &&
      appointment.date === payload.date &&
      appointment.timeSlot === payload.timeSlot &&
      appointment.status === "scheduled",
  );
}

export const mockApiAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => window.setTimeout(resolve, 240));

  const url = new URL(
    config.url?.startsWith("http")
      ? config.url
      : `https://mock.healthcare.local${config.url ?? ""}`,
  );
  const path = url.pathname.replace("/api", "");
  const method = (config.method ?? "get").toLowerCase();
  const database = readDatabase();

  if (path === "/auth/login" && method === "post") {
    const payload = parseRequestBody<LoginPayload>(config.data);
    const user = database.users.find(
      (item) =>
        item.email.toLowerCase() === payload.email.toLowerCase() &&
        item.password === payload.password,
    );

    if (!user) {
      return buildResponse(config, 401, {
        message: "Invalid email or password.",
      });
    }

    database.session = { userId: user.id };
    writeDatabase(database);

    return buildResponse<AuthResponse>(config, 200, {
      user: sanitizeUser(user),
      token: `token-${user.id}`,
    });
  }

  if (path === "/auth/signup" && method === "post") {
    const payload = parseRequestBody<SignupPayload>(config.data);
    const existingUser = database.users.find(
      (item) => item.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (existingUser) {
      return buildResponse(config, 409, {
        message: "An account with this email already exists.",
      });
    }

    const idPrefix = payload.role === "doctor" ? "doctor" : "patient";
    const newUser: UserRecord = {
      id: `${idPrefix}-${crypto.randomUUID()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      specialization: payload.role === "doctor" ? payload.specialization : undefined,
    };

    database.users.push(newUser);

    if (payload.role === "doctor") {
      database.doctors.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: "doctor",
        specialization: payload.specialization ?? "General Medicine",
        experienceYears: 5,
        consultationFee: 100,
        rating: 4.6,
        location: "Community Care Center",
        about:
          "Provides attentive, evidence-based care and welcomes ongoing follow-up for better outcomes.",
        qualifications: ["Licensed Physician", "Hospital Credentialed"],
        availableTimeSlots: ["09:00", "10:00", "11:00", "14:00", "16:00"],
      });
    }

    database.session = { userId: newUser.id };
    writeDatabase(database);

    return buildResponse<AuthResponse>(config, 201, {
      user: sanitizeUser(newUser),
      token: `token-${newUser.id}`,
    });
  }

  if (path === "/auth/session" && method === "get") {
    if (!database.session) {
      return buildResponse(config, 401, {
        message: "No active session found.",
      });
    }

    const user = findUser(database, database.session.userId);

    if (!user) {
      database.session = null;
      writeDatabase(database);

      return buildResponse(config, 401, {
        message: "Session expired.",
      });
    }

    return buildResponse(config, 200, sanitizeUser(user));
  }

  if (path === "/auth/logout" && method === "post") {
    database.session = null;
    writeDatabase(database);

    return buildResponse(config, 200, {
      success: true,
    });
  }

  if (path === "/doctors" && method === "get") {
    const specialization =
      config.params?.specialization ??
      url.searchParams.get("specialization") ??
      undefined;

    const doctors =
      specialization && specialization !== "All"
        ? database.doctors.filter((doctor) => doctor.specialization === specialization)
        : database.doctors;

    return buildResponse(config, 200, doctors);
  }

  if (path.startsWith("/doctors/") && method === "get") {
    const doctorId = path.split("/")[2];
    const doctor = database.doctors.find((item) => item.id === doctorId);

    if (!doctor) {
      return buildResponse(config, 404, {
        message: "Doctor profile not found.",
      });
    }

    return buildResponse(config, 200, doctor);
  }

  if (path === "/appointments" && method === "get") {
    const doctorId =
      config.params?.doctorId ?? url.searchParams.get("doctorId") ?? undefined;
    const patientId =
      config.params?.patientId ?? url.searchParams.get("patientId") ?? undefined;
    const status =
      config.params?.status ?? url.searchParams.get("status") ?? undefined;

    let appointments = [...database.appointments];

    if (doctorId) {
      appointments = appointments.filter((appointment) => appointment.doctorId === doctorId);
    }

    if (patientId) {
      appointments = appointments.filter(
        (appointment) => appointment.patientId === patientId,
      );
    }

    if (status) {
      appointments = appointments.filter((appointment) => appointment.status === status);
    }

    appointments.sort((first, second) => {
      const firstValue = `${first.date} ${first.timeSlot}`;
      const secondValue = `${second.date} ${second.timeSlot}`;
      return firstValue.localeCompare(secondValue);
    });

    return buildResponse(
      config,
      200,
      appointments.map((appointment) => enrichAppointment(database, appointment)),
    );
  }

  if (path === "/appointments" && method === "post") {
    const payload = parseRequestBody<BookAppointmentPayload>(config.data);
    const doctor = database.doctors.find((item) => item.id === payload.doctorId);
    const patient = findUser(database, payload.patientId);

    if (!doctor || !patient) {
      return buildResponse(config, 404, {
        message: "Unable to create appointment. Doctor or patient was not found.",
      });
    }

    if (isSlotTaken(database, payload)) {
      return buildResponse(config, 409, {
        message: "That time slot is already booked. Please choose another slot.",
      });
    }

    const now = new Date().toISOString();
    const appointment: Appointment = {
      id: `appt-${crypto.randomUUID()}`,
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      date: payload.date,
      timeSlot: payload.timeSlot,
      reason: payload.reason,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    };

    database.appointments.push(appointment);
    writeDatabase(database);

    return buildResponse(config, 201, enrichAppointment(database, appointment));
  }

  if (path.startsWith("/appointments/") && method === "patch") {
    const appointmentId = path.split("/")[2];
    const payload = parseRequestBody<UpdateAppointmentPayload>(config.data);
    const appointment = database.appointments.find((item) => item.id === appointmentId);

    if (!appointment) {
      return buildResponse(config, 404, {
        message: "Appointment not found.",
      });
    }

    if (
      (payload.date || payload.timeSlot) &&
      isSlotTaken(
        database,
        {
          doctorId: appointment.doctorId,
          date: payload.date ?? appointment.date,
          timeSlot: payload.timeSlot ?? appointment.timeSlot,
        },
        appointment.id,
      )
    ) {
      return buildResponse(config, 409, {
        message: "That new slot is already taken. Please pick another one.",
      });
    }

    appointment.date = payload.date ?? appointment.date;
    appointment.timeSlot = payload.timeSlot ?? appointment.timeSlot;
    appointment.status = payload.status ?? appointment.status;
    appointment.updatedAt = new Date().toISOString();

    writeDatabase(database);

    return buildResponse(config, 200, enrichAppointment(database, appointment));
  }

  return buildResponse(config, 404, {
    message: `Route ${method.toUpperCase()} ${path} is not implemented.`,
  });
};
