'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Wrench, Users, ArrowRight, AlertCircle } from 'lucide-react';
import type { EquipmentItem, User } from '@/types';
import { equipmentPictureUrl } from '@/lib/legacy-barcode';
import { sqliteBool } from '@/lib/equipment';

interface EquipmentListResponse {
  user: User;
  items: EquipmentItem[];
  ban?: unknown;
}

export default function EquipmentPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data } = await apiClient.get<EquipmentListResponse>('/equipment');
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

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Could not load equipment
            </CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Request failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = data?.items ?? [];
  const inListCount = items.filter((i) => sqliteBool(i.inList)).length;
  const totalUnits = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Equipment Library</h1>
          </div>
          <p className="text-xl text-orange-100 mb-4">
            Borrow and lend equipment with the community. Queue and transfers use the legacy Barcode app
            until those flows are rebuilt here.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {data?.ban ? (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive text-base">Borrowing restriction</CardTitle>
              <CardDescription>
                Your account has an active equipment borrowing restriction. Open the legacy site for
                details or contact a moderator.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catalog items</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total units</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your wait lists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inListCount}</div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">All equipment</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No equipment in the catalog.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.itemId} className="overflow-hidden flex flex-col">
                <div className="aspect-video relative bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={equipmentPictureUrl(item.picture)}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>
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
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {sqliteBool(item.inList) ? <Badge variant="secondary">You are in line</Badge> : null}
                    {sqliteBool(item.hasIt) ? <Badge>You have a unit</Badge> : null}
                    {sqliteBool(item.isAvailable) ? <Badge variant="outline">Marked returned</Badge> : null}
                  </div>
                  <Link href={`/equipment/${item.itemId}`} className="block">
                    <Button className="w-full">
                      Queue &amp; details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
