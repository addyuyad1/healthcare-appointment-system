import { appointmentsApi } from "./appointmentsApi";
import { authApi } from "../../auth/api/authApi";
import { setAuthToken } from "../../../services/authToken";

describe("appointmentsApi", () => {
  it("prevents double booking for the same doctor slot", async () => {
    const authResponse = await authApi.login({
      email: "patient@care.com",
      password: "password123",
    });
    setAuthToken(authResponse.token);

    const bookedAppointment = await appointmentsApi.bookAppointment({
      date: "2030-02-15",
      doctorId: "doctor-1",
      patientId: "patient-1",
      reason: "Follow-up cardiology review",
      timeSlot: "14:00",
    });

    expect(bookedAppointment.timeSlot).toBe("14:00");

    await expect(
      appointmentsApi.bookAppointment({
        date: "2030-02-15",
        doctorId: "doctor-1",
        patientId: "patient-1",
        reason: "Second booking attempt",
        timeSlot: "14:00",
      }),
    ).rejects.toMatchObject({
      response: {
        data: {
          message: "That time slot is already booked. Please choose another slot.",
        },
      },
    });
  });
});
