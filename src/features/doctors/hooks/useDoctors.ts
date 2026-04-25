import { useEffect, useState } from "react";
import { doctorsApi } from "../api/doctorsApi";
import type {
  DoctorProfile,
  DoctorsQuery,
  PaginatedResponse,
} from "../../../shared/types/models";
import { getErrorMessage } from "../../../services/http";

const defaultDoctorsResponse: PaginatedResponse<DoctorProfile> = {
  items: [],
  page: 1,
  pageSize: 6,
  total: 0,
  totalPages: 1,
};

export function useDoctors(query: DoctorsQuery) {
  const [response, setResponse] = useState<PaginatedResponse<DoctorProfile>>(
    defaultDoctorsResponse,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void doctorsApi
      .getDoctors(query)
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setResponse(result);
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
  }, [
    query.availabilityDate,
    query.minRating,
    query.page,
    query.pageSize,
    query.search,
    query.specialization,
  ]);

  return { doctors: response.items, error, isLoading, pagination: response };
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
