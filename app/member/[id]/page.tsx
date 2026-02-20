'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Box, Droplets } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { User, Frag, Tank } from '@/types';

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['member', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        member: User;
        frags: Frag[];
        tanks: Tank[];
      }>(`/user/${userId}`);
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

  if (!data?.member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Member Not Found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { member, frags, tanks } = data;
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                {member.location && (
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-1 mb-4">
                    <MapPin className="h-4 w-4" />
                    {member.location}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div>
                    <p className="text-2xl font-bold">{frags?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Corals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{tanks?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Tanks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {frags?.filter(f => f.rules === 'dbtc').length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">DBTC</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="collection">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="collection">
              <Box className="mr-2 h-4 w-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="tanks">
              <Droplets className="mr-2 h-4 w-4" />
              Tanks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-6">
            {!frags || frags.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Box className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No corals in collection</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {frags.map((frag) => (
                  <Card key={frag.fragId} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={frag.picture ? `/bc/uploads/${frag.picture}` : '/placeholder-coral.png'}
                        alt={frag.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{frag.name}</CardTitle>
                      {frag.scientificName && (
                        <CardDescription>{frag.scientificName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Link href={`/frag/${frag.fragId}`}>
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tanks" className="mt-6">
            {!tanks || tanks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Droplets className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No tanks added</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tanks.map((tank) => (
                  <Card key={tank.tankId}>
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
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/tank/${tank.tankId}`}>
                        <Button className="w-full" variant="outline">
                          View Tank
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
