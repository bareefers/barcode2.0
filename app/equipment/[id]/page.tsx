'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wrench, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { EquipmentItem } from '@/types';

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ item: EquipmentItem; queue: any[] }>(`/equipment/${itemId}`);
      return data;
    },
  });

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

  const { item, queue } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image & Details */}
          <Card className="lg:sticky lg:top-24 h-fit">
            {item.picture && (
              <div className="aspect-video relative">
                <Image
                  src={`/bc/uploads/${item.picture}`}
                  alt={item.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{item.name}</CardTitle>
                  <CardDescription className="mt-2">
                    Owned by{' '}
                    <Link href={`/member/${item.owner.id}`} className="text-primary hover:underline">
                      {item.owner.name}
                    </Link>
                    {item.owner.location && ` in ${item.owner.location}`}
                  </CardDescription>
                </div>
                <Badge variant={item.status === 'available' ? 'secondary' : 'default'}>
                  {item.status === 'available' ? 'Available' : 'In Use'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              )}

              <div className="space-y-3">
                {item.status === 'available' && !item.inLine && (
                  <Link href={`/equipment/get-in-line/${item.itemId}`}>
                    <Button className="w-full" size="lg">
                      Get in Line
                    </Button>
                  </Link>
                )}
                {item.inLine && (
                  <Button variant="outline" className="w-full" size="lg" disabled>
                    You're in Line
                  </Button>
                )}
                {item.currentHolder && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Currently with</p>
                    <Link href={`/member/${item.currentHolder.id}`} className="text-primary hover:underline">
                      {item.currentHolder.name}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Queue & Tabs */}
          <div>
            <Card>
              <Tabs defaultValue="queue">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="queue">
                      <Users className="mr-2 h-4 w-4" />
                      Queue ({queue?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <Clock className="mr-2 h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="queue" className="px-6 pb-6">
                  {!queue || queue.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No one in line yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {queue.map((person, index) => (
                        <div key={person.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Link href={`/member/${person.id}`} className="font-medium hover:underline">
                              {person.name}
                            </Link>
                            {person.location && (
                              <p className="text-sm text-muted-foreground">{person.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
