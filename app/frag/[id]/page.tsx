'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FragCard } from '@/components/frag-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Frag, User } from '@/types';

interface FragDetailResponse {
  user: User;
  frag: Frag;
}

export default function FragDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const rawId = routeParams?.id;
  const fragId =
    typeof rawId === 'string'
      ? parseInt(rawId, 10)
      : Array.isArray(rawId)
        ? parseInt(rawId[0] ?? '', 10)
        : NaN;
  const idValid = Number.isFinite(fragId) && fragId > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['frag', 'detail', fragId],
    queryFn: async () => {
      const { data } = await apiClient.get<FragDetailResponse>(`/dbtc/frag/${fragId}`);
      return data;
    },
    enabled: idValid,
  });

  if (!idValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Frag Not Found</h2>
          <p className="text-muted-foreground mb-4">Invalid frag link.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading frag details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.frag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Frag Not Found</h2>
          <p className="text-muted-foreground mb-4 text-sm max-w-md">
            This frag may be private, removed, or you may need to log in to the forum first.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col items-center gap-4">
          <FragCard frag={data.frag} user={data.user} showOwner={true} expanded={true} />
          {data.frag.motherId ? (
            <Button variant="outline" asChild>
              <Link href={`/kids/${data.frag.motherId}`}>All frags of this coral</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
