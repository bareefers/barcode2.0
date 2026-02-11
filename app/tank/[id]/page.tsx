'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Droplets, TestTube, Fish, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tank } from '@/types';

export default function TankDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tankId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['tank', tankId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ tank: Tank }>(`/tank/${tankId}`);
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

  if (!data?.tank) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tank Not Found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { tank } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tanks
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tank Info */}
          <Card className="lg:col-span-1">
            {tank.picture && (
              <div className="aspect-video relative">
                <Image
                  src={`/bc/uploads/${tank.picture}`}
                  alt={tank.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tank.name}</CardTitle>
              <CardDescription>
                {tank.volume && `${tank.volume} gallons`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tank.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{tank.description}</p>
                </div>
              )}
              {tank.startDate && (
                <div>
                  <h3 className="font-semibold mb-2">Started</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tank.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Link href={`/tank/${tank.tankId}/parameters`}>
                  <Button className="w-full" variant="outline">
                    <TestTube className="mr-2 h-4 w-4" />
                    Parameters
                  </Button>
                </Link>
                <Link href={`/tank/${tank.tankId}/livestock`}>
                  <Button className="w-full" variant="outline">
                    <Fish className="mr-2 h-4 w-4" />
                    Livestock
                  </Button>
                </Link>
                <Link href={`/tank/${tank.tankId}/pictures`}>
                  <Button className="w-full" variant="outline">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Pictures
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tank Tabs */}
          <Card className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="corals">Corals</TabsTrigger>
                  <TabsTrigger value="journal">Journal</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="overview" className="px-6 pb-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Tank Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Corals</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-bold">-</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">Livestock</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-2xl font-bold">-</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="corals" className="px-6 pb-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Droplets className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No corals assigned to this tank yet</p>
                  <Link href={`/tank/${tank.tankId}/assign-coral`}>
                    <Button className="mt-4">Assign Corals</Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="journal" className="px-6 pb-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Journal entries coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
