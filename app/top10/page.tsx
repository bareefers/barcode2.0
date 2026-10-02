'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

type TopRow = { ownerId?: number; ownerName?: string; count: number };

interface Top10Response {
  contributors: TopRow[];
  linkers: TopRow[];
  givers: TopRow[];
  journalers: TopRow[];
  collectors: TopRow[];
  likes: TopRow[];
}

const LISTS: {
  key: keyof Top10Response;
  name: string;
  desc: string;
  notUsers?: boolean;
}[] = [
  { key: 'contributors', name: 'Contributors', desc: 'Contributed the most items to DBTC' },
  { key: 'linkers', name: 'Linkers', desc: 'Have put back the most frags' },
  { key: 'givers', name: 'Givers', desc: 'Have given the most frags' },
  { key: 'journalers', name: 'Journalers', desc: 'Created the most journal entries' },
  { key: 'collectors', name: 'Collectors', desc: 'Have the most DBTC frags alive' },
  { key: 'likes', name: 'Popular', desc: 'Have the most members waiting', notUsers: true },
];

export default function Top10Page() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dbtc', 'top10'],
    queryFn: async () => {
      const { data } = await apiClient.get<Top10Response>('/dbtc/top10');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground text-center">Could not load Top 10. Try logging in to the forum.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-4 py-12 flex items-center gap-3">
          <Trophy className="h-10 w-10 shrink-0" />
          <div>
            <h1 className="text-4xl font-bold">DBTC Top 10</h1>
            <p className="text-teal-100 mt-1">Community leaderboards (same data as classic BARcode)</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {LISTS.map((list) => (
            <Card key={list.key}>
              <CardHeader>
                <CardTitle>{list.name}</CardTitle>
                <CardDescription>{list.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    {(data[list.key] ?? []).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-2 text-left">
                          {list.notUsers ? (
                            <span>{row.ownerName ?? '—'}</span>
                          ) : row.ownerId != null ? (
                            <Link href={`/member/${row.ownerId}`} className="text-primary hover:underline">
                              {row.ownerName ?? `#${row.ownerId}`}
                            </Link>
                          ) : (
                            row.ownerName ?? '—'
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums font-medium">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
