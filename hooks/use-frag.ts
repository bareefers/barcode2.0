import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { 
  FragTreeResponse, 
  FragKidsResponse, 
  FanResponse, 
  ShareResponse 
} from '@/types';

export function useFragLineage(motherId: number, enabled = false) {
  return useQuery({
    queryKey: ['frag', 'lineage', motherId],
    queryFn: async () => {
      const { data } = await apiClient.get<FragTreeResponse>(`/dbtc/tree/${motherId}`);
      return data;
    },
    enabled,
  });
}

export function useFragKids(motherId: number, enabled = false) {
  return useQuery({
    queryKey: ['frag', 'kids', motherId],
    queryFn: async () => {
      const { data } = await apiClient.get<FragKidsResponse>(`/dbtc/kids/${motherId}`);
      return data;
    },
    enabled,
  });
}

export function useFragFans(motherId: number, enabled = false) {
  return useQuery({
    queryKey: ['frag', 'fans', motherId],
    queryFn: async () => {
      const { data } = await apiClient.get<FanResponse>(`/dbtc/fan/${motherId}`);
      return data;
    },
    enabled,
  });
}

export function useBecomeFan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motherId: number) => {
      const { data } = await apiClient.put<FanResponse>(`/dbtc/fan/${motherId}`);
      return data;
    },
    onSuccess: (_, motherId) => {
      queryClient.invalidateQueries({ queryKey: ['frag', 'fans', motherId] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
  });
}

export function useRemoveFan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motherId: number) => {
      const { data } = await apiClient.delete<FanResponse>(`/dbtc/fan/${motherId}`);
      return data;
    },
    onSuccess: (_, motherId) => {
      queryClient.invalidateQueries({ queryKey: ['frag', 'fans', motherId] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    },
  });
}

export function useShareFrag() {
  return useMutation({
    mutationFn: async (fragId: number) => {
      const { data } = await apiClient.get<ShareResponse>(`/dbtc/share/${fragId}`);
      return data;
    },
  });
}

export function useReportOops() {
  return useMutation({
    mutationFn: async ({ fragId, notes }: { fragId: number; notes: string }) => {
      const formData = new FormData();
      formData.set('notes', notes);
      await apiClient.post(`/dbtc/oops/${fragId}`, formData);
    },
  });
}
