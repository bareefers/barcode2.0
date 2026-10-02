'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';

export default function MembersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: suggestions, isFetching } = useQuery({
    queryKey: ['find-users', searchQuery],
    queryFn: async () => {
      const { data } = await apiClient.get<{ users: [number, string][] }>('/dbtc/find-users', {
        params: { prefix: searchQuery, all: 'true' },
      });
      return data.users.map(([id, name]) => ({ id, name }));
    },
    enabled: searchQuery.trim().length >= 2,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Users className="h-7 w-7" />
              Member lookup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Start typing a member name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            {isFetching && (
              <p className="text-sm text-muted-foreground text-center">Searching…</p>
            )}
            {suggestions && suggestions.length > 0 && (
              <ul className="border rounded-md divide-y max-h-80 overflow-y-auto">
                {suggestions.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm font-medium"
                      onClick={() => router.push(`/member/${u.id}`)}
                    >
                      {u.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.trim().length >= 2 && !isFetching && suggestions?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No members found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
