'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Box, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get('/impersonate');
      return data;
    },
  });

  // Check if user has admin access
  if (!userData?.canImpersonate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel.
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
            System administration and moderation tools
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage members and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Users
              </Button>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Box className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Review and moderate coral listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Moderate Content
              </Button>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <AlertCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View reported issues and problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Settings
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Box className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed system analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stats">
                <Button className="w-full" variant="outline">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Impersonation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Impersonate User</CardTitle>
              <CardDescription>
                View site as another user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Impersonate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
