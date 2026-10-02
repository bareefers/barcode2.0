'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FragCard } from '@/components/frag-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import type { EnumsResponse, Frag, User } from '@/types';

const FORUM_LOGIN = 'https://bareefers.org/forum/login/';
const ALLOWED = new Set(['dbtc', 'pif']);

type CollectionFilters = {
  name?: string;
  type?: string;
  available?: boolean;
  member?: { id: number; name: string } | null;
};

type PageResponse = { user: User; mothers: Frag[] };

export default function RulesCollectionClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rules = String(params.rules || '').toLowerCase();
  const valid = ALLOWED.has(rules);

  const [showFilter, setShowFilter] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<string>('');
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftMember, setDraftMember] = useState<{ id: number; name: string } | null>(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [filters, setFilters] = useState<CollectionFilters>({});

  useEffect(() => {
    const ownerId = searchParams.get('ownerId');
    const ownerName = searchParams.get('ownerName');
    if (ownerId) {
      const member = { id: Number(ownerId), name: ownerName || `User #${ownerId}` };
      setDraftMember(member);
      setFilters({ member });
    }
  }, [searchParams]);

  const { data: enumsData } = useQuery({
    queryKey: ['enums'],
    queryFn: async () => {
      const { data } = await apiClient.get<EnumsResponse>('/dbtc/enums');
      return data;
    },
    enabled: valid,
  });

  const { data: memberSuggestions } = useQuery({
    queryKey: ['find-users', memberQuery],
    queryFn: async () => {
      const { data } = await apiClient.get<{ users: [number, string][] }>('/dbtc/find-users', {
        params: { prefix: memberQuery, all: 'true' },
      });
      return data.users.map(([id, name]) => ({ id, name }));
    },
    enabled: memberQuery.trim().length >= 2,
  });

  const queryKey = useMemo(
    () => ['collection-rules', rules, filters] as const,
    [rules, filters]
  );

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    enabled: valid,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<PageResponse>(
        `/dbtc/collection/${encodeURIComponent(rules)}/p/${pageParam}`,
        {
          params: {
            type: filters.type || undefined,
            name: filters.name ? `%${filters.name}%` : undefined,
            ownerId: filters.member?.id || undefined,
            available: filters.available ? 1 : undefined,
          },
        }
      );
      return data;
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.mothers.length === 0 ? undefined : lastPageParam + 1,
  });

  const mothers = useMemo(
    () => data?.pages.flatMap((p) => p.mothers) ?? [],
    [data]
  );
  const user = data?.pages[0]?.user;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { rootMargin: '300px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onIntersect]);

  const applyFilter = () => {
    setFilters({
      name: draftName.trim() || undefined,
      type: draftType || undefined,
      available: draftAvailable || undefined,
      member: draftMember,
    });
    setShowFilter(false);
  };

  const clearFilter = () => {
    setDraftName('');
    setDraftType('');
    setDraftAvailable(false);
    setDraftMember(null);
    setMemberQuery('');
    setFilters({});
    setShowFilter(false);
  };

  if (!valid) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Unknown collection</h1>
        <p className="text-muted-foreground mb-4">Use DBTC or PIF collection.</p>
        <Button asChild>
          <a href="/collection/dbtc">DBTC collection</a>
        </Button>
      </div>
    );
  }

  const is401 = (error as { response?: { status?: number } })?.response?.status === 401;
  if (error) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className={is401 ? '' : 'text-destructive'}>
              {is401 ? 'Log in required' : 'Error loading collection'}
            </CardTitle>
            <CardDescription>
              {is401
                ? 'Please log in to the forum to continue.'
                : 'Unable to load this collection.'}
            </CardDescription>
          </CardHeader>
          {is401 && (
            <CardContent>
              <Button asChild>
                <a href={FORUM_LOGIN} target="_blank" rel="noopener noreferrer">
                  Log in to BAR forum
                </a>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  const title = `${rules.toUpperCase()} Collection`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => setShowFilter(true)} variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
            {filters.name && (
              <Badge variant="secondary" className="gap-1">
                {filters.name}
                <button type="button" aria-label="Clear name" onClick={() => setFilters((f) => ({ ...f, name: undefined }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.available && (
              <Badge variant="secondary" className="gap-1">
                Has frags available
                <button type="button" aria-label="Clear available" onClick={() => setFilters((f) => ({ ...f, available: undefined }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                {filters.type}
                <button type="button" aria-label="Clear type" onClick={() => setFilters((f) => ({ ...f, type: undefined }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.member && (
              <Badge variant="secondary" className="gap-1">
                {filters.member.name}
                <button type="button" aria-label="Clear member" onClick={() => setFilters((f) => ({ ...f, member: null }))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.name || filters.type || filters.available || filters.member) && (
              <Button variant="ghost" size="sm" onClick={clearFilter}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : mothers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No items match these filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mothers.map((m) => (
              <FragCard key={m.fragId} frag={m} user={user!} showOwner />
            ))}
          </div>
        )}
        <div ref={sentinelRef} className="h-10 flex items-center justify-center py-6">
          {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter part of the name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Available</Label>
              <Select
                value={draftAvailable ? 'yes' : 'any'}
                onValueChange={(v) => setDraftAvailable(v === 'yes')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Has frags available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={draftType || 'any'} onValueChange={(v) => setDraftType(v === 'any' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  {(enumsData?.types ?? []).map((t) => {
                    const label = typeof t === 'string' ? t : t.type;
                    return (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Member</Label>
              {draftMember ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{draftMember.name}</Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDraftMember(null)}>
                    Clear
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Type a member name…"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                  />
                  {memberSuggestions && memberSuggestions.length > 0 && (
                    <ul className="border rounded-md max-h-40 overflow-y-auto text-sm">
                      {memberSuggestions.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                            onClick={() => {
                              setDraftMember(u);
                              setMemberQuery('');
                            }}
                          >
                            {u.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={clearFilter}>
                Clear
              </Button>
              <Button onClick={applyFilter}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
