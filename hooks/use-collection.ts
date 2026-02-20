import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { CollectionResponse, EnumsResponse, Settings } from '@/types';

export function useCollection() {
  return useQuery({
    queryKey: ['collection'],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionResponse>('/dbtc/your-collection');
      return data;
    },
  });
}

export function useEnums() {
  return useQuery({
    queryKey: ['enums'],
    queryFn: async () => {
      const { data } = await apiClient.get<EnumsResponse>('/dbtc/enums');
      return data;
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<Settings>('/user/settings');
      return data;
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      await apiClient.put(`/user/settings/${encodeURIComponent(key)}/${encodeURIComponent(value)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
