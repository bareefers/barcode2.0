'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Frag, User } from '@/types';

interface KidsResponse {
  user: User;
  frags: Frag[];
}

export default function KidsPage() {
  const router = useRouter();
  const routeParams = useParams();
  const raw = routeParams?.motherId;
  const motherId =
    typeof raw === 'string'
      ? parseInt(raw, 10)
      : Array.isArray(raw)
        ? parseInt(raw[0] ?? '', 10)
        : NaN;
  const idValid = Number.isFinite(motherId) && motherId > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dbtc', 'kids', motherId],
    queryFn: async () => {
      const { data } = await apiClient.get<KidsResponse>(`/dbtc/kids/${motherId}`);
      return data;
    },
    enabled: idValid,
  });

  if (!idValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid mother id.</p>
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

  if (error || !data?.frags?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Could not load frags</h2>
          <p className="text-muted-foreground text-sm mb-4">
            This mother may be private or you may need to log in.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const titleName = data.frags[0]?.name ?? 'Mother';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-8">All frags of {titleName}</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.frags.map((frag) => (
            <Card key={frag.fragId} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {frag.picture ? (
                  <Image
                    src={`/bc/uploads/${frag.picture}`}
                    alt={frag.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{frag.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {frag.ownsIt ? 'Owned by you' : frag.owner ? `Owned by ${frag.owner.name}` : ''}
                </p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/frag/${frag.fragId}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
