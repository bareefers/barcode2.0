import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { User, ImpersonateResponse } from '@/types';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get<ImpersonateResponse>('/impersonate');
      return data;
    },
  });
}

export function useImpersonate() {
  const queryClient = useQueryClient();

  const start = useMutation({
    mutationFn: async (userId: number) => {
      await apiClient.put(`/impersonate/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const stop = useMutation({
    mutationFn: async () => {
      await apiClient.delete('/impersonate');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return { start, stop };
}
