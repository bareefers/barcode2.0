'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Box, Ban, ListOrdered, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get('/impersonate');
      return data;
    },
  });

  if (!userData?.canImpersonate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don&apos;t have permission to access the admin panel.
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-xl text-red-100">
            Manage equipment, holders, bans, and listings
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Box className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Equipment queue</CardTitle>
              <CardDescription>
                Manage who&apos;s in line, add/remove users, transfer items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/equipment">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Manage equipment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Equipment holders</CardTitle>
              <CardDescription>
                Add or remove users who can hold equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/holders">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Manage holders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Ban className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Bans</CardTitle>
              <CardDescription>
                Ban or unban users from equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/bans">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Manage bans
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ListOrdered className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Listings (DBTC)</CardTitle>
              <CardDescription>
                Run admin scripts for frags and mothers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/scripts">
                <Button className="w-full" variant="outline">
                  Run scripts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wrench className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Impersonate user</CardTitle>
              <CardDescription>
                View the site as another user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Coming soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Box className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View system analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stats">
                <Button className="w-full" variant="outline">
                  View stats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
