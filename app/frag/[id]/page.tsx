'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { FragCard } from '@/components/frag-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Frag, User } from '@/types';

export default function FragDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fragId = parseInt(params.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['frag', fragId],
    queryFn: async () => {
      // In the original app, there's no single frag endpoint, 
      // so we'd need to either create one or get it from collection
      // For now, let's simulate it
      const { data: collectionData } = await apiClient.get<{ user: User; frags: Frag[] }>('/dbtc/your-collection');
      const frag = collectionData.frags.find(f => f.fragId === fragId);
      
      if (!frag) {
        throw new Error('Frag not found');
      }
      
      return { frag, user: collectionData.user };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading frag details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Frag Not Found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex justify-center">
          <FragCard 
            frag={data.frag} 
            user={data.user} 
            showOwner={true}
            expanded={true}
          />
        </div>
      </div>
    </div>
  );
}
