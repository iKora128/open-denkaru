import { useQuery } from '@tanstack/react-query';
import { medicalApi } from '@/lib/api';
import type { Patient } from '@/types/patient';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async (): Promise<Patient[]> => {
      const data = await medicalApi.patients.list();
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for medical data
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePatientStats() {
  return useQuery({
    queryKey: ['patient-stats'],
    queryFn: async () => {
      return await medicalApi.patients.getStatistics();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
    retry: 2,
  });
}