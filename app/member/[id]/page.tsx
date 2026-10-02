'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type StatBucket = { type: string; count: number; fragIds?: number[] };
type StatLine = { title: string; data: StatBucket[] };

interface MemberPayload {
  id: number;
  name: string;
  title?: string;
  location?: string;
  messageCount?: number;
  registerDate?: number | string;
  registerAge?: string;
  lastActivity?: number | string;
  viewUrl?: string;
  avatarUrl?: string;
  isMe?: boolean;
  tankJournals?: { title: string; url: string }[];
  availableFrags?: { fragId: number; name: string; type: string; count: number }[];
  waitingFor?: { fragId: number; name: string; type: string }[];
  linksCompleted?: { fragId: number; name: string; type: string; count: number }[];
  stats?: { dbtc?: StatLine[]; pif?: StatLine[] };
}

function formatJoined(registerDate?: number | string) {
  if (registerDate == null) return null;
  const d = typeof registerDate === 'number' ? new Date(registerDate * 1000) : new Date(registerDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: member, isLoading, error } = useQuery({
    queryKey: ['dbtc-member', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<MemberPayload>(`/dbtc/member/${userId}`);
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

  if (error || !member) {
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

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joined = formatJoined(member.registerDate);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-2xl">{member.name}</CardTitle>
                <CardDescription className="mt-1 space-y-1">
                  <div>
                    {[member.title, member.location, member.messageCount != null ? `${member.messageCount} messages` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  {joined && (
                    <div>
                      Joined {joined}
                      {member.registerAge ? ` · ${member.registerAge}` : ''}
                    </div>
                  )}
                  {member.viewUrl && (
                    <div>
                      <a href={member.viewUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        view forum profile
                      </a>
                    </div>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!!member.tankJournals?.length && (
              <section>
                <h3 className="font-semibold mb-2">Tank journals</h3>
                <ul className="space-y-1 text-sm">
                  {member.tankJournals.map((tj, i) => (
                    <li key={i}>
                      <a href={tj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {tj.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!member.availableFrags?.length && (
              <section>
                <h3 className="font-semibold mb-2">Has available frags</h3>
                <ul className="space-y-1 text-sm">
                  {member.availableFrags.map((af) => (
                    <li key={af.fragId}>
                      <strong>{af.count}</strong>{' '}
                      <Link href={`/frag/${af.fragId}`} className="text-primary hover:underline">
                        {af.name}
                      </Link>{' '}
                      <span className="text-muted-foreground">({af.type})</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!member.waitingFor?.length && (
              <section>
                <h3 className="font-semibold mb-2">Would like frags of</h3>
                <ul className="space-y-1 text-sm">
                  {member.waitingFor.map((wf) => (
                    <li key={wf.fragId}>
                      <Link href={`/frag/${wf.fragId}`} className="text-primary hover:underline">
                        {wf.name}
                      </Link>{' '}
                      <span className="text-muted-foreground">({wf.type})</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!member.linksCompleted?.length && (
              <section>
                <h3 className="font-semibold mb-2">DBTC links completed</h3>
                <ul className="space-y-1 text-sm">
                  {member.linksCompleted.map((lc) => (
                    <li key={lc.fragId}>
                      <strong>{lc.count}</strong>{' '}
                      <Link href={`/frag/${lc.fragId}`} className="text-primary hover:underline">
                        {lc.name}
                      </Link>{' '}
                      <span className="text-muted-foreground">({lc.type})</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!member.stats?.dbtc?.length && (
              <section>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-semibold">DBTC stats</h3>
                  <Link
                    href={`/collection/dbtc?ownerId=${member.id}&ownerName=${encodeURIComponent(member.name)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    view collection
                  </Link>
                </div>
                {member.stats.dbtc.map((line, i) =>
                  line.data?.length ? (
                    <div key={i} className="mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{line.title}</h4>
                      <div className="flex flex-wrap gap-3 text-sm mt-1">
                        {line.data.map((t) => (
                          <span key={t.type}>
                            <strong>{t.count}</strong> {t.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </section>
            )}

            {!!member.stats?.pif?.length && (
              <section>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-semibold">PIF stats</h3>
                  <Link
                    href={`/collection/pif?ownerId=${member.id}&ownerName=${encodeURIComponent(member.name)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    view collection
                  </Link>
                </div>
                {member.stats.pif.map((line, i) =>
                  line.data?.length ? (
                    <div key={i} className="mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{line.title}</h4>
                      <div className="flex flex-wrap gap-3 text-sm mt-1">
                        {line.data.map((t) => (
                          <span key={t.type}>
                            <strong>{t.count}</strong> {t.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
