'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, Clock, Users, ArrowRight } from 'lucide-react';
import type { EquipmentItem } from '@/types';

export default function EquipmentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: EquipmentItem[] }>('/equipment');
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

  const availableItems = data?.items.filter(item => item.status === 'available') || [];
  const inUseItems = data?.items.filter(item => item.status === 'in_use') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Equipment Library</h1>
          </div>
          <p className="text-xl text-orange-100 mb-8">
            Borrow and lend equipment with the community
          </p>
          <Link href="/equipment/add">
            <Button size="lg" variant="secondary">
              Add Equipment
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Use</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inUseItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.items.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Equipment */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Now</h2>
          {availableItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No equipment available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableItems.map((item) => (
                <Card key={item.itemId} className="overflow-hidden">
                  {item.picture && (
                    <div className="aspect-video relative">
                      <Image
                        src={`/bc/uploads/${item.picture}`}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>
                      Owned by {item.owner.name}
                      {item.owner.location && ` in ${item.owner.location}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="secondary">Available</Badge>
                      {item.queueLength && item.queueLength > 0 && (
                        <Badge variant="outline">{item.queueLength} in line</Badge>
                      )}
                    </div>
                    <Link href={`/equipment/${item.itemId}`} className="mt-4 block">
                      <Button className="w-full">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* In Use Equipment */}
        {inUseItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Currently In Use</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inUseItems.map((item) => (
                <Card key={item.itemId} className="overflow-hidden opacity-75">
                  {item.picture && (
                    <div className="aspect-video relative">
                      <Image
                        src={`/bc/uploads/${item.picture}`}
                        alt={item.name}
                        fill
                        className="object-cover grayscale"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>
                      {item.currentHolder && `Currently with ${item.currentHolder.name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Badge>In Use</Badge>
                      {item.queueLength && item.queueLength > 0 && (
                        <Badge variant="outline">{item.queueLength} waiting</Badge>
                      )}
                    </div>
                    {item.inLine ? (
                      <Badge variant="secondary" className="mt-4">You're in line</Badge>
                    ) : (
                      <Link href={`/equipment/get-in-line/${item.itemId}`} className="mt-4 block">
                        <Button variant="outline" className="w-full">
                          Get in Line
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
