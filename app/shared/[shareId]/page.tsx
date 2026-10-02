'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FragCard } from '@/components/frag-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import type { Frag, User } from '@/types';

/** `GET /public/shared/:shareId` — payload matches stored share JSON + shareType. */
interface SharedFragPayload {
  shareType: string;
  frag: Frag;
}

const GUEST: User = { id: 0, name: 'Guest' };

export default function SharedFragPage() {
  const router = useRouter();
  const routeParams = useParams();
  const raw = routeParams?.shareId;
  const shareId =
    typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] ?? '') : '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'shared', shareId],
    queryFn: async () => {
      const { data } = await apiClient.get<SharedFragPayload>(
        `/public/shared/${encodeURIComponent(shareId)}`
      );
      return data;
    },
    enabled: Boolean(shareId),
  });

  if (!shareId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid share link.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data?.frag || data.shareType !== 'frag') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Share not found</h2>
          <p className="text-muted-foreground mb-4">This link may have expired or is invalid.</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
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
          <h1 className="text-2xl font-semibold text-center">{data.frag.name}</h1>
          {!data.frag.ownsIt && data.frag.owner ? (
            <p className="text-muted-foreground text-center">
              Shared by <span className="font-medium text-foreground">{data.frag.owner.name}</span>
            </p>
          ) : null}
          <FragCard frag={data.frag} user={GUEST} showOwner={true} expanded={true} />
        </div>
      </div>
    </div>
  );
}
