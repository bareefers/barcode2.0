'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { CollectionResponse } from '@/types';

const FORUM_LOGIN = 'https://bareefers.org/forum/login/';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['collection'],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionResponse>('/dbtc/your-collection');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const is401 = (error as { response?: { status?: number } })?.response?.status === 401;
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className={is401 ? '' : 'text-destructive'}>
              {is401 ? 'Log in required' : 'Error Loading Collection'}
            </CardTitle>
            <CardDescription>
              {is401
                ? 'Please log in to the forum to continue.'
                : 'Unable to load your collection. Please try again later.'}
            </CardDescription>
          </CardHeader>
          {is401 && (
            <CardContent className="space-y-3">
              <Button asChild>
                <a href={FORUM_LOGIN} target="_blank" rel="noopener noreferrer">
                  Log in to BAR forum
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                After you log in, return to this tab and refresh the page.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">BARcode</h1>
          <p className="text-xl text-blue-100 mb-8">
            Bay Area Reefers Coral Tracking & Community Platform
          </p>
          <div className="flex gap-4">
            <Link href="/collection">
              <Button size="lg" variant="secondary">
                View Your Collection
              </Button>
            </Link>
            <Link href="/add">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow">
                Add New Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome back, {data?.user.name}!</CardTitle>
              <CardDescription>
                You have {data?.frags.length || 0} items in your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {data?.frags.filter(f => f.isAlive).length || 0} Alive
                </Badge>
                <Badge variant="outline">
                  {data?.frags.filter(f => f.rules === 'dbtc').length || 0} DBTC
                </Badge>
                <Badge variant="outline">
                  {data?.frags.filter(f => f.rules === 'pif').length || 0} PIF
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🪸 DBTC
              </CardTitle>
              <CardDescription>
                Don&apos;t Break The Chain coral tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/collection">
                <Button className="w-full">View Collection</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 Equipment
              </CardTitle>
              <CardDescription>
                Community equipment lending library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/equipment">
                <Button className="w-full">Browse Equipment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🐠 Tanks
              </CardTitle>
              <CardDescription>
                Tank profiles and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tanks">
                <Button className="w-full">View Tanks</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🛒 Marketplace
              </CardTitle>
              <CardDescription>
                Buy and sell corals with members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/market">
                <Button className="w-full">Visit Market</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Members
              </CardTitle>
              <CardDescription>
                Community member directory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/members">
                <Button className="w-full">View Members</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Statistics
              </CardTitle>
              <CardDescription>
                Charts and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stats">
                <Button className="w-full">View Stats</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Recent activity feed coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
