'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { parseISO } from 'date-fns';
import { legacyBarcodeUrl } from '@/lib/legacy-barcode';

export interface SwapParticipant {
  name: string;
  items?: string;
}

export interface Swap {
  swapId: number;
  name: string;
  date: string;
  time?: string;
  address: string;
  threadUrl?: string;
  mapUrl?: string;
  isOpen?: boolean;
  participants: SwapParticipant[];
}

interface SwapsResponse {
  swaps: Swap[];
}

function formatAddress(addr: string): string[] {
  if (!addr) return [];
  return addr.split(/\r\n|\n|\\n/).filter(Boolean);
}

export default function SwapsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dbtc', 'swaps'],
    queryFn: async () => {
      const { data } = await apiClient.get<SwapsResponse>('/dbtc/swaps');
      const swaps = (data.swaps ?? []).map((swap) => {
        const lines = formatAddress(swap.address);
        let dateLabel = swap.date;
        try {
          const d = parseISO(swap.date);
          dateLabel = d.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          /* keep raw */
        }
        return { ...swap, addressLines: lines, dateLabel };
      });
      return { swaps };
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
        <p className="text-muted-foreground text-center">Could not load swaps. Try logging in to the forum.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold">Frag swaps</h1>
          <p className="text-violet-100 mt-2">Upcoming and past club swap meets</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.swaps.map((swap) => (
            <Card key={swap.swapId}>
              <CardHeader>
                <CardTitle>{swap.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{(swap as Swap & { dateLabel?: string }).dateLabel ?? swap.date}</p>
                    {swap.time ? <p className="text-muted-foreground">{swap.time}</p> : null}
                    {swap.threadUrl ? (
                      <a
                        href={swap.threadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs underline"
                      >
                        Details
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    {(swap as Swap & { addressLines?: string[] }).addressLines?.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    {swap.mapUrl ? (
                      <a
                        href={swap.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs underline"
                      >
                        Map
                      </a>
                    ) : null}
                  </div>
                </div>
                {swap.participants?.length ? (
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <Users className="h-4 w-4" />
                      Participants
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {swap.participants.map((p, i) => (
                        <li key={i}>
                          {p.name}
                          {p.items ? ` — ${p.items}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {swap.isOpen ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={legacyBarcodeUrl(`/bc/swap/${swap.swapId}/add`)} rel="noopener noreferrer">
                      Add a frag
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
        {data.swaps.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No swaps scheduled.</p>
        ) : null}
      </div>
    </div>
  );
}
