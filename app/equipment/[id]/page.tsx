'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import type {
  EquipmentHaveEntry,
  EquipmentItem,
  EquipmentQueuePayload,
  EquipmentWaiterEntry,
  User,
} from '@/types';
import { equipmentPictureUrl, legacyBarcodeUrl } from '@/lib/legacy-barcode';
import { sqliteBool, whereToGetInLine } from '@/lib/equipment';

interface QueueResponse {
  user: User;
  ban?: unknown;
  item: EquipmentItem;
  queue: EquipmentQueuePayload;
}

function legacyEquipmentPath(suffix: string): string {
  return legacyBarcodeUrl(`/bc/equipment/${suffix}`);
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get<QueueResponse>(`/equipment/queue/${itemId}`);
      return data;
    },
  });

  const { available, inUse, waiters, cta, queueTotal } = useMemo(() => {
    const z = {
      available: [] as EquipmentHaveEntry[],
      inUse: [] as EquipmentHaveEntry[],
      waiters: [] as EquipmentWaiterEntry[],
      cta: false as ReturnType<typeof whereToGetInLine>,
      queueTotal: 0,
    };
    if (!data?.queue) return z;
    const haves = data.queue.haves ?? [];
    const w = data.queue.waiters ?? [];
    const available = haves.filter((h) => h.isAvailable);
    const inUse = haves.filter((h) => !h.isAvailable);
    const cta = whereToGetInLine(data.item, data.ban, available, inUse, w);
    return {
      available,
      inUse,
      waiters: w,
      cta,
      queueTotal: haves.length + w.length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Equipment Not Found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { item, user } = data;
  const getInLineHref = legacyEquipmentPath(`get-in-line/${item.itemId}`);
  const passHref = legacyEquipmentPath(`pass/${item.itemId}`);
  const dropOutHref = legacyEquipmentPath(`drop-out/${item.itemId}`);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment
        </Button>

        {data.ban ? (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">Borrowing restriction</CardTitle>
              <CardDescription>
                You may be unable to join queues until this is cleared. Check the legacy Barcode app or
                contact a moderator.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:sticky lg:top-24 h-fit">
            <div className="aspect-video relative bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={equipmentPictureUrl(item.picture)}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">{item.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {item.quantity} available to borrow for {item.maxDays} days.{' '}
                    <a href={item.rules} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Rules
                    </a>
                    {' · '}
                    <a
                      href={item.instructions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Instructions
                    </a>
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {sqliteBool(item.inList) ? <Badge variant="secondary">You are in line</Badge> : null}
                {sqliteBool(item.hasIt) ? <Badge>You have a unit</Badge> : null}
                {sqliteBool(item.isAvailable) ? <Badge variant="outline">Marked returned</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cta ? (
                <Button className="w-full" size="lg" asChild>
                  <a href={getInLineHref} rel="noopener noreferrer">
                    Get in line
                  </a>
                </Button>
              ) : null}
              {sqliteBool(item.inList) && !sqliteBool(item.hasIt) ? (
                <Button variant="outline" className="w-full" asChild>
                  <a href={dropOutHref} rel="noopener noreferrer">
                    Drop out
                  </a>
                </Button>
              ) : null}
              {sqliteBool(item.hasIt) ? (
                <div className="flex flex-col gap-2">
                  <Button className="w-full" asChild>
                    <a href={passHref} rel="noopener noreferrer">
                      Pass it on / Done with it
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Transfers use the legacy Barcode flow on{' '}
                    <span className="whitespace-nowrap">{new URL(passHref).host}</span>.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div>
            <Card>
              <Tabs defaultValue="queue">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="queue">
                      <Users className="mr-2 h-4 w-4" />
                      Queue ({queueTotal})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <Clock className="mr-2 h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="queue" className="px-6 pb-6 space-y-8">
                  {available.length > 0 ? (
                    <section>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        Available ({available.length})
                      </h3>
                      <ul className="space-y-2">
                        {available.map((av, i) => (
                          <li key={i} className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">
                              {av.user.id === user.id ? (
                                'You'
                              ) : (
                                <>
                                  <Link href={`/member/${av.user.id}`} className="text-primary hover:underline">
                                    {av.user.name}
                                  </Link>
                                  {av.location ? ` in ${av.location}` : ''}
                                </>
                              )}
                            </div>
                            {av.ageAvailable ? (
                              <p className="text-muted-foreground text-xs mt-1">{av.ageAvailable}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {inUse.length > 0 ? (
                    <section>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        In use ({inUse.length})
                      </h3>
                      <ul className="space-y-2">
                        {inUse.map((av, i) => (
                          <li key={i} className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">
                              {av.user.id === user.id ? (
                                'You'
                              ) : (
                                <>
                                  <Link href={`/member/${av.user.id}`} className="text-primary hover:underline">
                                    {av.user.name}
                                  </Link>
                                  {av.location ? ` in ${av.location}` : ''}
                                </>
                              )}
                            </div>
                            {av.age ? <p className="text-muted-foreground text-xs mt-1">{av.age}</p> : null}
                            {av.overdue ? (
                              <Badge variant="destructive" className="mt-2">
                                Overdue
                              </Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {waiters.length > 0 ? (
                    <section>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        Waiting ({waiters.length})
                      </h3>
                      <ul className="space-y-2">
                        {waiters.map((w, i) => (
                          <li key={i} className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">
                              {w.user.id === user.id ? (
                                'You'
                              ) : (
                                <>
                                  <Link href={`/member/${w.user.id}`} className="text-primary hover:underline">
                                    {w.user.name}
                                  </Link>
                                  {w.location ? ` in ${w.location}` : ''}
                                </>
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs mt-1">{w.ageWaiting}</p>
                            <p className="text-muted-foreground text-xs">Should get it {w.eta}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {queueTotal === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No queue entries yet.</p>
                    </div>
                  ) : null}
                </TabsContent>

                <TabsContent value="history" className="px-6 pb-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>History coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
