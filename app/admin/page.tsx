'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Box, Ban, Store } from 'lucide-react';
import Link from 'next/link';
import { legacyBarcodeUrl } from '@/lib/legacy-barcode';

type AdminUser = {
  canModerate?: boolean;
  canImpersonate?: boolean;
  isAdmin?: boolean;
  isMod?: boolean;
};

export default function AdminPage() {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUser>('/impersonate');
      return data;
    },
  });

  const canAccess = Boolean(
    userData?.canModerate || userData?.canImpersonate || userData?.isAdmin || userData?.isMod
  );

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              Forum moderators (XenForo Moderating group) and BARcode admins can access this panel.
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
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Moderation</h1>
          </div>
          <p className="text-red-100">
            Manage equipment status, holders, and bans
            {userData?.isMod && !userData?.isAdmin ? ' (moderator)' : ''}
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
                Status, location, current holder, transfers, mark returned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/equipment">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Manage equipment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Who may hold</CardTitle>
              <CardDescription>Add/remove equipment holders and their locations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/holders">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Manage holders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Ban className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Equipment bans</CardTitle>
              <CardDescription>Ban or unban members from equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/bans">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Manage bans</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow opacity-90">
            <CardHeader>
              <Store className="h-8 w-8 mb-2 text-muted-foreground" />
              <CardTitle>Marketplace listings</CardTitle>
              <CardDescription>
                Market listing/transaction APIs are not live yet in BARcode 2.0. Use classic for any market
                seller tools until we build moderation here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href={legacyBarcodeUrl('/bc/market')} target="_blank" rel="noopener noreferrer">
                  Open classic market
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
