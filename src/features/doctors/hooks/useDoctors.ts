import { useEffect, useState } from "react";
import { doctorsApi } from "../api/doctorsApi";
import type { DoctorProfile } from "../../../shared/types/models";
import { getErrorMessage } from "../../../services/http";

export function useDoctors(specialization?: string) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void doctorsApi
      .getDoctors(specialization && specialization !== "All" ? specialization : undefined)
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setDoctors(result);
        setError(null);
      })
      .catch((reason) => {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [specialization]);

  return { doctors, error, isLoading };
}

export function useDoctor(doctorId?: string) {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setIsLoading(false);
      setError("Doctor not found.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    void doctorsApi
      .getDoctorById(doctorId)
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setDoctor(result);
        setError(null);
      })
      .catch((reason) => {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  return { doctor, error, isLoading };
}
