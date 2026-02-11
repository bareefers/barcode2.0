'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Droplets, Plus } from 'lucide-react';
import type { Tank } from '@/types';

export default function TanksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tanks'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ tanks: Tank[] }>('/tank');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="h-12 w-12" />
            <h1 className="text-5xl font-bold">My Tanks</h1>
          </div>
          <p className="text-xl text-cyan-100 mb-8">
            Manage your reef tanks and track parameters
          </p>
          <Link href="/add-tank">
            <Button size="lg" variant="secondary">
              <Plus className="mr-2 h-5 w-5" />
              Add Tank
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!data?.tanks || data.tanks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Droplets className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tanks Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first tank to start tracking parameters and livestock
              </p>
              <Link href="/add-tank">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tank
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.tanks.map((tank) => (
              <Card key={tank.tankId} className="overflow-hidden hover:shadow-lg transition-shadow">
                {tank.picture && (
                  <div className="aspect-video relative">
                    <Image
                      src={`/bc/uploads/${tank.picture}`}
                      alt={tank.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tank.name}</CardTitle>
                  <CardDescription>
                    {tank.volume && `${tank.volume} gallons`}
                    {tank.startDate && ` • Started ${new Date(tank.startDate).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tank.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tank.description}
                    </p>
                  )}
                  <Link href={`/tank/${tank.tankId}`}>
                    <Button className="w-full">View Tank</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
