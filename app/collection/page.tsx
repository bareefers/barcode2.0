'use client';

import { useState, useMemo } from 'react';
import { useCollection, useEnums, useUpdateSetting, useSettings } from '@/hooks/use-collection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Grid, List, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Frag, FragFilter } from '@/types';

export default function CollectionPage() {
  const { data: collectionData, isLoading } = useCollection();
  const { data: enumsData } = useEnums();
  const { data: settingsData } = useSettings();
  const updateSetting = useUpdateSetting();

  const [view, setView] = useState<'cards' | 'gallery'>('cards');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFrag, setSelectedFrag] = useState<Frag | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FragFilter>({
    alive: true,
  });

  // Apply settings when loaded
  useMemo(() => {
    if (settingsData?.yourCollectionView) {
      setView(settingsData.yourCollectionView);
    }
  }, [settingsData]);

  // Filter frags
  const filteredFrags = useMemo(() => {
    if (!collectionData?.frags) return [];
    
    return collectionData.frags.filter((frag) => {
      if (filters.name && !frag.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.type && frag.type !== filters.type) {
        return false;
      }
      if (filters.collection && frag.rules.toUpperCase() !== filters.collection) {
        return false;
      }
      if (filters.alive && !frag.isAlive) {
        return false;
      }
      return true;
    });
  }, [collectionData?.frags, filters]);

  const handleViewChange = (newView: 'cards' | 'gallery') => {
    setView(newView);
    updateSetting.mutate({ key: 'yourCollectionView', value: newView });
  };

  const clearFilter = () => {
    setFilters({ alive: true });
    setShowFilter(false);
  };

  const removeFilter = (key: keyof FragFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Your Collection</h1>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowFilter(true)} variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
            
            <Link href="/add">
              <Button>Add New Item</Button>
            </Link>

            <div className="flex gap-1 border rounded-md p-1 ml-auto">
              <Button
                variant={view === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('cards')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'gallery' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('gallery')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.name && (
                <Badge variant="secondary" className="gap-1">
                  {filters.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('name')}
                  />
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="gap-1">
                  {filters.type}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('type')}
                  />
                </Badge>
              )}
              {filters.collection && (
                <Badge variant="secondary" className="gap-1">
                  {filters.collection}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('collection')}
                  />
                </Badge>
              )}
              {filters.alive && (
                <Badge variant="secondary" className="gap-1">
                  Alive
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('alive')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground mb-6">
          Showing {filteredFrags.length} of {collectionData?.frags.length || 0} items
        </p>

        {view === 'gallery' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFrags.map((frag) => (
              <div 
                key={frag.fragId}
                className="aspect-square relative overflow-hidden rounded-lg cursor-pointer border hover:border-primary transition-colors"
                onClick={() => setSelectedFrag(frag)}
              >
                <Image
                  src={frag.picture ? `/bc/uploads/${frag.picture}` : '/placeholder-coral.png'}
                  alt={frag.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFrags.map((frag) => (
              <Card key={frag.fragId} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={frag.picture ? `/bc/uploads/${frag.picture}` : '/placeholder-coral.png'}
                    alt={frag.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{frag.name}</CardTitle>
                  {frag.scientificName && (
                    <CardDescription>{frag.scientificName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{frag.type}</Badge>
                    <Badge variant="outline">{frag.rules.toUpperCase()}</Badge>
                    {!frag.isAlive && (
                      <Badge variant="destructive">
                        {frag.status === 'transferred' ? 'Transferred' : 'RIP'}
                      </Badge>
                    )}
                    {frag.fragsAvailable > 0 && (
                      <Badge variant="secondary">
                        {frag.fragsAvailable} available
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href={`/frag/${frag.fragId}`}>
                      <Button className="w-full" variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredFrags.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No items found matching your filters.
              </p>
              <Button onClick={clearFilter} className="mt-4">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Collection</DialogTitle>
            <DialogDescription>
              Filter your coral collection by various criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter part of the name"
                value={filters.name || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.type || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {enumsData?.types.map(({ type }) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="collection">Collection</Label>
              <Select
                value={filters.collection || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value as any }))}
              >
                <SelectTrigger id="collection">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DBTC">DBTC</SelectItem>
                  <SelectItem value="PIF">PIF</SelectItem>
                  <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alive"
                checked={filters.alive}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, alive: checked as boolean }))
                }
              />
              <Label htmlFor="alive">Show only alive items</Label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilter} className="flex-1">
              Clear
            </Button>
            <Button onClick={() => setShowFilter(false)} className="flex-1">
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
