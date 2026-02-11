'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import type { MarketListing } from '@/types';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ listings: MarketListing[] }>('/market');
      return data;
    },
  });

  const filteredListings = data?.listings.filter(listing =>
    listing.frag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.frag.type.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Marketplace</h1>
          </div>
          <p className="text-xl text-green-100 mb-8">
            Buy and sell corals with fellow reefers
          </p>
          <Link href="/market/sell">
            <Button size="lg" variant="secondary">
              List an Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Be the first to list an item!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card key={listing.listingId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image
                    src={listing.frag.picture ? `/bc/uploads/${listing.frag.picture}` : '/placeholder-coral.png'}
                    alt={listing.frag.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                      ${listing.price}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{listing.frag.name}</CardTitle>
                  <CardDescription>
                    {listing.frag.scientificName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{listing.frag.type}</Badge>
                    <Badge variant="secondary">
                      {listing.seller.name}
                      {listing.seller.location && ` • ${listing.seller.location}`}
                    </Badge>
                  </div>
                  {listing.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                  <Link href={`/market/${listing.listingId}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
