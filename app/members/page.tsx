'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Users, Search, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { User } from '@/types';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ members: User[] }>('/user/members');
      return data;
    },
  });

  const filteredMembers = data?.members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Community Members</h1>
          </div>
          <p className="text-xl text-purple-100">
            Connect with fellow Bay Area Reefers
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
              <p className="text-muted-foreground">
                Try a different search term
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => {
              const initials = member.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle>{member.name}</CardTitle>
                    {member.location && (
                      <CardDescription className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/member/${member.id}`}>
                      <Button className="w-full" variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
