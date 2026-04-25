import { AxiosError } from "axios";
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
  DoctorsQuery,
  LoginPayload,
  NotificationCategory,
  NotificationChannel,
  NotificationItem,
  PaginatedResponse,
  SignupPayload,
  UpdateAppointmentPayload,
  User,
  UserRecord,
} from "../shared/types/models";

interface Database {
  users: UserRecord[];
  doctors: DoctorProfile[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  session: {
    token: string;
    userId: string;
  } | null;
}

interface ResponseErrorPayload {
  message: string;
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
  const database: Database = {
    users: seedUsers,
    doctors: seedDoctors,
    appointments: seedAppointments,
    notifications: [],
    session: null,
  };

  createNotification(
    database,
    "patient-1",
    "Welcome back",
    "Your care workspace is ready. Review upcoming visits or discover new doctors.",
    "system",
    ["in-app"],
  );

  createNotification(
    database,
    "doctor-1",
    "Schedule summary ready",
    "Your dashboard is set up with upcoming consultations and live notification support.",
    "system",
    ["in-app"],
  );

  return database;
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

function rejectResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: ResponseErrorPayload,
) {
  const response = buildResponse(config, status, data);
  return Promise.reject(
    new AxiosError(
      data.message,
      String(status),
      config,
      undefined,
      response,
    ),
  );
}

function getAuthorizedUser(database: Database, config: InternalAxiosRequestConfig) {
  const authorizationHeader =
    (config.headers.Authorization as string | undefined) ??
    (config.headers.authorization as string | undefined);
  const token = authorizationHeader?.replace("Bearer ", "");

  if (!token || !database.session || token !== database.session.token) {
    return null;
  }

  return findUser(database, database.session.userId) ?? null;
}

function findUser(database: Database, userId: string) {
  return database.users.find((user) => user.id === userId);
}

function findDoctor(database: Database, doctorId: string) {
  return database.doctors.find((doctor) => doctor.id === doctorId);
}

function enrichAppointment(
  database: Database,
  appointment: Appointment,
): AppointmentRecord {
  const doctor = findDoctor(database, appointment.doctorId);
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

function createNotification(
  database: Database,
  userId: string,
  title: string,
  message: string,
  category: NotificationCategory,
  channels: NotificationChannel[],
  appointmentId?: string,
) {
  const createdAt = new Date().toISOString();

  channels.forEach((channel) => {
    database.notifications.push({
      id: `notification-${crypto.randomUUID()}`,
      appointmentId,
      category,
      channel,
      createdAt,
      message,
      read: channel === "email",
      title,
      userId,
    });
  });
}

function createAppointmentNotifications(
  database: Database,
  appointment: Appointment,
  category: Exclude<NotificationCategory, "system" | "reminder">,
) {
  const enrichedAppointment = enrichAppointment(database, appointment);
  const patientTitleMap = {
    booking: "Appointment booked",
    cancellation: "Appointment cancelled",
    reschedule: "Appointment updated",
  };
  const doctorTitleMap = {
    booking: "New patient booking",
    cancellation: "Appointment cancelled",
    reschedule: "Schedule updated",
  };

  const patientMessage =
    category === "booking"
      ? `Your appointment with ${enrichedAppointment.doctorName} is confirmed for ${appointment.date} at ${appointment.timeSlot}.`
      : category === "cancellation"
        ? `Your appointment with ${enrichedAppointment.doctorName} on ${appointment.date} at ${appointment.timeSlot} was cancelled.`
        : `Your appointment with ${enrichedAppointment.doctorName} has been moved to ${appointment.date} at ${appointment.timeSlot}.`;

  const doctorMessage =
    category === "booking"
      ? `${enrichedAppointment.patientName} booked ${appointment.date} at ${appointment.timeSlot}.`
      : category === "cancellation"
        ? `${enrichedAppointment.patientName}'s appointment on ${appointment.date} at ${appointment.timeSlot} was cancelled.`
        : `${enrichedAppointment.patientName}'s appointment was rescheduled to ${appointment.date} at ${appointment.timeSlot}.`;

  createNotification(
    database,
    appointment.patientId,
    patientTitleMap[category],
    patientMessage,
    category,
    ["in-app", "email"],
    appointment.id,
  );

  createNotification(
    database,
    appointment.doctorId,
    doctorTitleMap[category],
    doctorMessage,
    category,
    ["in-app", "email"],
    appointment.id,
  );
}

function ensureReminderNotifications(database: Database, userId?: string) {
  const today = new Date();

  database.appointments.forEach((appointment) => {
    if (appointment.status !== "scheduled") {
      return;
    }

    const appointmentDate = new Date(`${appointment.date}T00:00:00`);
    const dayDifference = Math.ceil(
      (appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDifference < 0 || dayDifference > 1) {
      return;
    }

    [appointment.patientId, appointment.doctorId].forEach((recipientId) => {
      if (userId && recipientId !== userId) {
        return;
      }

      const exists = database.notifications.some(
        (notification) =>
          notification.appointmentId === appointment.id &&
          notification.userId === recipientId &&
          notification.category === "reminder" &&
          notification.channel === "in-app",
      );

      if (exists) {
        return;
      }

      const counterpart =
        recipientId === appointment.patientId
          ? enrichAppointment(database, appointment).doctorName
          : enrichAppointment(database, appointment).patientName;
      const noun = recipientId === appointment.patientId ? "with" : "for";

      createNotification(
        database,
        recipientId,
        "Upcoming appointment reminder",
        `Reminder: you have an appointment ${noun} ${counterpart} on ${appointment.date} at ${appointment.timeSlot}.`,
        "reminder",
        ["in-app", "email"],
        appointment.id,
      );
    });
  });
}

function parseNumber(value: unknown, fallback?: number) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

function isDoctorAvailableOnDate(
  database: Database,
  doctor: DoctorProfile,
  date: string,
) {
  const bookedSlots = new Set(
    database.appointments
      .filter(
        (appointment) =>
          appointment.doctorId === doctor.id &&
          appointment.date === date &&
          appointment.status === "scheduled",
      )
      .map((appointment) => appointment.timeSlot),
  );

  return doctor.availableTimeSlots.some((slot) => !bookedSlots.has(slot));
}

function getDoctorQuery(config: InternalAxiosRequestConfig, url: URL): DoctorsQuery {
  return {
    availabilityDate:
      (config.params?.availabilityDate as string | undefined) ??
      url.searchParams.get("availabilityDate") ??
      undefined,
    minRating: parseNumber(
      config.params?.minRating ?? url.searchParams.get("minRating"),
      undefined,
    ),
    page: parseNumber(config.params?.page ?? url.searchParams.get("page"), 1),
    pageSize: parseNumber(config.params?.pageSize ?? url.searchParams.get("pageSize"), 6),
    search:
      (config.params?.search as string | undefined) ??
      url.searchParams.get("search") ??
      undefined,
    specialization:
      (config.params?.specialization as string | undefined) ??
      url.searchParams.get("specialization") ??
      undefined,
  };
}

function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 6,
): PaginatedResponse<T> {
  const safePageSize = Math.max(pageSize, 1);
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / safePageSize), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * safePageSize;

  return {
    items: items.slice(startIndex, startIndex + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
}

export const mockApiAdapter: AxiosAdapter = async (config) => {
  await new Promise((resolve) => window.setTimeout(resolve, 220));

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
      return rejectResponse(config, 401, {
        message: "Invalid email or password.",
      });
    }

    const token = `token-${user.id}-${crypto.randomUUID()}`;
    database.session = { token, userId: user.id };
    writeDatabase(database);

    return buildResponse<AuthResponse>(config, 200, {
      user: sanitizeUser(user),
      token,
    });
  }

  if (path === "/auth/signup" && method === "post") {
    const payload = parseRequestBody<SignupPayload>(config.data);
    const existingUser = database.users.find(
      (item) => item.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (existingUser) {
      return rejectResponse(config, 409, {
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

    const token = `token-${newUser.id}-${crypto.randomUUID()}`;
    database.session = { token, userId: newUser.id };
    createNotification(
      database,
      newUser.id,
      "Account created",
      "Your account is ready. Start exploring doctors, appointments, and live reminders.",
      "system",
      ["in-app"],
    );
    writeDatabase(database);

    return buildResponse<AuthResponse>(config, 201, {
      user: sanitizeUser(newUser),
      token,
    });
  }

  if (path === "/auth/session" && method === "get") {
    const user = getAuthorizedUser(database, config);

    if (!database.session || !user) {
      return rejectResponse(config, 401, {
        message: "No active session found.",
      });
    }

    return buildResponse(config, 200, sanitizeUser(user));
  }

  if (path === "/auth/logout" && method === "post") {
    if (!getAuthorizedUser(database, config)) {
      return rejectResponse(config, 401, {
        message: "You are not authorized to perform this action.",
      });
    }

    database.session = null;
    writeDatabase(database);

    return buildResponse(config, 200, {
      success: true,
    });
  }

  if (path === "/doctors" && method === "get") {
    const query = getDoctorQuery(config, url);
    const normalizedSearch = query.search?.trim().toLowerCase();

    let doctors = [...database.doctors];

    if (normalizedSearch) {
      doctors = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(normalizedSearch),
      );
    }

    if (query.specialization && query.specialization !== "All") {
      doctors = doctors.filter(
        (doctor) => doctor.specialization === query.specialization,
      );
    }

    const minRating = query.minRating;

    if (minRating !== undefined) {
      doctors = doctors.filter((doctor) => doctor.rating >= minRating);
    }

    if (query.availabilityDate) {
      doctors = doctors.filter((doctor) =>
        isDoctorAvailableOnDate(database, doctor, query.availabilityDate!),
      );
    }

    doctors.sort((first, second) => second.rating - first.rating);

    return buildResponse(
      config,
      200,
      paginate(doctors, query.page, query.pageSize),
    );
  }

  if (path.startsWith("/doctors/") && method === "get") {
    const doctorId = path.split("/")[2];
    const doctor = findDoctor(database, doctorId);

    if (!doctor) {
      return rejectResponse(config, 404, {
        message: "Doctor profile not found.",
      });
    }

    return buildResponse(config, 200, doctor);
  }

  if (path === "/appointments" && method === "get") {
    if (!getAuthorizedUser(database, config)) {
      return rejectResponse(config, 401, {
        message: "You are not authorized to view appointments.",
      });
    }

    const doctorId =
      (config.params?.doctorId as string | undefined) ??
      url.searchParams.get("doctorId") ??
      undefined;
    const patientId =
      (config.params?.patientId as string | undefined) ??
      url.searchParams.get("patientId") ??
      undefined;
    const status =
      (config.params?.status as string | undefined) ??
      url.searchParams.get("status") ??
      undefined;

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
    const authorizedUser = getAuthorizedUser(database, config);

    if (!authorizedUser) {
      return rejectResponse(config, 401, {
        message: "You are not authorized to create appointments.",
      });
    }

    const payload = parseRequestBody<BookAppointmentPayload>(config.data);
    const doctor = findDoctor(database, payload.doctorId);
    const patient = findUser(database, payload.patientId);

    if (!doctor || !patient || authorizedUser.id !== payload.patientId) {
      return rejectResponse(config, 404, {
        message: "Unable to create appointment. Doctor or patient was not found.",
      });
    }

    if (isSlotTaken(database, payload)) {
      return rejectResponse(config, 409, {
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
    createAppointmentNotifications(database, appointment, "booking");
    writeDatabase(database);

    return buildResponse(config, 201, enrichAppointment(database, appointment));
  }

  if (path.startsWith("/appointments/") && method === "patch") {
    const authorizedUser = getAuthorizedUser(database, config);

    if (!authorizedUser) {
      return rejectResponse(config, 401, {
        message: "You are not authorized to update appointments.",
      });
    }

    const appointmentId = path.split("/")[2];
    const payload = parseRequestBody<UpdateAppointmentPayload>(config.data);
    const appointment = database.appointments.find((item) => item.id === appointmentId);

    if (!appointment) {
      return rejectResponse(config, 404, {
        message: "Appointment not found.",
      });
    }

    if (
      authorizedUser.id !== appointment.patientId &&
      authorizedUser.id !== appointment.doctorId
    ) {
      return rejectResponse(config, 403, {
        message: "You do not have permission to update this appointment.",
      });
    }

    const originalStatus = appointment.status;
    const nextDate = payload.date ?? appointment.date;
    const nextTimeSlot = payload.timeSlot ?? appointment.timeSlot;

    if (
      (payload.date || payload.timeSlot) &&
      isSlotTaken(
        database,
        {
          doctorId: appointment.doctorId,
          date: nextDate,
          timeSlot: nextTimeSlot,
        },
        appointment.id,
      )
    ) {
      return rejectResponse(config, 409, {
        message: "That new slot is already taken. Please pick another one.",
      });
    }

    appointment.date = nextDate;
    appointment.timeSlot = nextTimeSlot;
    appointment.status = payload.status ?? appointment.status;
    appointment.updatedAt = new Date().toISOString();

    if (payload.status === "cancelled" && originalStatus !== "cancelled") {
      createAppointmentNotifications(database, appointment, "cancellation");
    } else if (payload.date || payload.timeSlot) {
      createAppointmentNotifications(database, appointment, "reschedule");
    }

    writeDatabase(database);

    return buildResponse(config, 200, enrichAppointment(database, appointment));
  }

  if (path === "/notifications" && method === "get") {
    const authorizedUser = getAuthorizedUser(database, config);
    const userId =
      (config.params?.userId as string | undefined) ??
      url.searchParams.get("userId") ??
      undefined;

    if (!userId || !authorizedUser || authorizedUser.id !== userId) {
      return rejectResponse(config, 400, {
        message: "A userId is required to load notifications.",
      });
    }

    ensureReminderNotifications(database, userId);

    const page = parseNumber(config.params?.page ?? url.searchParams.get("page"), 1) ?? 1;
    const pageSize =
      parseNumber(config.params?.pageSize ?? url.searchParams.get("pageSize"), 8) ?? 8;

    const notifications = database.notifications
      .filter((notification) => notification.userId === userId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

    writeDatabase(database);

    return buildResponse(config, 200, paginate(notifications, page, pageSize));
  }

  if (path.startsWith("/notifications/") && method === "patch") {
    const authorizedUser = getAuthorizedUser(database, config);

    if (!authorizedUser) {
      return rejectResponse(config, 401, {
        message: "You are not authorized to update notifications.",
      });
    }

    const notificationId = path.split("/")[2];
    const payload = parseRequestBody<{ read?: boolean }>(config.data);
    const notification = database.notifications.find((item) => item.id === notificationId);

    if (!notification) {
      return rejectResponse(config, 404, {
        message: "Notification not found.",
      });
    }

    if (notification.userId !== authorizedUser.id) {
      return rejectResponse(config, 403, {
        message: "You do not have permission to update this notification.",
      });
    }

    notification.read = payload.read ?? notification.read;
    writeDatabase(database);

    return buildResponse(config, 200, notification);
  }

  if (path === "/notifications/read-all" && method === "post") {
    const authorizedUser = getAuthorizedUser(database, config);
    const payload = parseRequestBody<{ userId?: string }>(config.data);

    if (!payload.userId || !authorizedUser || authorizedUser.id !== payload.userId) {
      return rejectResponse(config, 400, {
        message: "A userId is required to mark notifications as read.",
      });
    }

    database.notifications = database.notifications.map((notification) =>
      notification.userId === payload.userId
        ? { ...notification, read: true }
        : notification,
    );
    writeDatabase(database);

    return buildResponse(config, 200, { success: true });
  }

  return rejectResponse(config, 404, {
    message: `Route ${method.toUpperCase()} ${path} is not implemented.`,
  });
};
