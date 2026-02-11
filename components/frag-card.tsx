'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {  
  MoreVertical, 
  Pencil, 
  AlertCircle, 
  Link as LinkIcon, 
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import type { Frag, User } from '@/types';
import { useFragLineage, useFragKids, useFragFans, useBecomeFan, useRemoveFan, useShareFrag, useReportOops } from '@/hooks/use-frag';

interface FragCardProps {
  frag: Frag;
  user: User;
  showOwner?: boolean;
  expanded?: boolean;
}

export function FragCard({ frag, user, showOwner = false, expanded = false }: FragCardProps) {
  const router = useRouter();
  const [showTabs, setShowTabs] = useState(expanded);
  const [oopsDialogOpen, setOopsDialogOpen] = useState(false);
  const [oopsNotes, setOopsNotes] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [requestConfirmed, setRequestConfirmed] = useState(false);

  const { data: lineageData } = useFragLineage(frag.motherId, showTabs);
  const { data: kidsData } = useFragKids(frag.motherId, showTabs);
  const { data: fansData } = useFragFans(frag.motherId, showTabs);
  
  const becomeFan = useBecomeFan();
  const removeFan = useRemoveFan();
  const shareFrag = useShareFrag();
  const reportOops = useReportOops();

  const ownsIt = frag.ownsIt;
  const isAlive = frag.isAlive;
  const isDbtc = frag.rules === 'dbtc';
  const isPrivate = frag.rules === 'private';
  const fragsAvailable = isPrivate ? 0 : frag.fragsAvailable + (frag.otherFragsAvailable || 0);

  const age = isAlive && frag.dateAcquired
    ? formatDistance(new Date(frag.dateAcquired), new Date(), { addSuffix: false }) + ' old'
    : null;

  const handleShareClick = async () => {
    setShareLink('');
    setShareDialogOpen(true);
    const result = await shareFrag.mutateAsync(frag.fragId);
    setShareLink(result.url);
  };

  const handleOopsSubmit = async () => {
    if (!oopsNotes) return;
    await reportOops.mutateAsync({ fragId: frag.fragId, notes: oopsNotes });
    setOopsNotes('');
    setOopsDialogOpen(false);
  };

  const handleBecomeFan = async () => {
    await becomeFan.mutateAsync(frag.motherId);
  };

  const handleRemoveFan = async () => {
    await removeFan.mutateAsync(frag.motherId);
  };

  return (
    <>
      <Card className="w-full max-w-md overflow-hidden">
        {/* Image */}
        <div className="relative h-72 w-full">
          <Image
            src={frag.picture ? `/bc/uploads/${frag.picture}` : '/placeholder-coral.png'}
            alt={frag.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <CardTitle className="text-lg">{frag.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {ownsIt && isAlive && !frag.isStatic && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/add?fragId=${frag.fragId}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOopsDialogOpen(true)}>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Report Issue
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/frag/${frag.fragId}`}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  View Page
                </Link>
              </DropdownMenuItem>
              {ownsIt && (
                <DropdownMenuItem onClick={handleShareClick}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scientific Name */}
        {frag.scientificName && (
          <CardDescription className="px-4 pb-2 italic">
            {frag.scientificName}
          </CardDescription>
        )}

        {/* Badges */}
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {showOwner && (
              <Badge variant={ownsIt ? 'default' : 'secondary'}>
                <Link href={`/member/${frag.owner.id}`} className="flex items-center gap-1">
                  {ownsIt ? 'Yours' : frag.owner.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Badge>
            )}
            
            {frag.threadUrl && (
              <Badge>
                <a href={frag.threadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  Thread
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Badge>
            )}

            <Badge variant="outline">{frag.type}</Badge>
            
            {age && <Badge variant="secondary">{age}</Badge>}
            
            {!frag.inCollection && (
              <Badge>{frag.rules.toUpperCase()}</Badge>
            )}

            {frag.hasOne && !ownsIt && frag.inCollection && (
              <Badge variant="outline">You have it</Badge>
            )}

            {frag.isFan && (
              <Badge variant="secondary" className="cursor-pointer" onClick={handleRemoveFan}>
                Requested frag ✕
              </Badge>
            )}

            {frag.fanCount && isAlive && (
              <Badge variant="outline">
                {frag.fanCount} requested
              </Badge>
            )}

            {fragsAvailable > 0 && (
              <Badge variant="default">
                {fragsAvailable} available
              </Badge>
            )}

            {!isAlive && (
              <Badge variant="destructive">
                {frag.status === 'transferred' ? 'Transferred' : 'RIP'}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTabs(!showTabs)}
            className="w-full"
          >
            {showTabs ? (
              <>Less <ChevronUp className="ml-2 h-4 w-4" /></>
            ) : (
              <>More <ChevronDown className="ml-2 h-4 w-4" /></>
            )}
          </Button>

          {showTabs && (
            <Tabs defaultValue="conditions" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="conditions">Info</TabsTrigger>
                {frag.notes && <TabsTrigger value="notes">Notes</TabsTrigger>}
                {!isPrivate && <TabsTrigger value="lineage">Lineage</TabsTrigger>}
                {!isPrivate && <TabsTrigger value="fans">Requests</TabsTrigger>}
              </TabsList>

              <TabsContent value="conditions" className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Light:</strong> {frag.light.toLowerCase()}</div>
                  <div><strong>Flow:</strong> {frag.flow.toLowerCase()}</div>
                  <div><strong>Hardiness:</strong> {frag.hardiness.toLowerCase()}</div>
                  <div><strong>Growth:</strong> {frag.growthRate.toLowerCase()}</div>
                </div>
              </TabsContent>

              {frag.notes && (
                <TabsContent value="notes">
                  <p className="text-sm">{frag.notes}</p>
                </TabsContent>
              )}

              <TabsContent value="lineage">
                <div className="text-sm">
                  {lineageData ? (
                    <p>Lineage tree visualization coming soon...</p>
                  ) : (
                    <p className="text-muted-foreground">Loading...</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fans" className="space-y-4">
                {fansData && (
                  <>
                    <p className="text-sm font-medium">
                      {fansData.likes === 0 
                        ? 'No requests yet' 
                        : `${fansData.likes} member${fansData.likes > 1 ? 's' : ''} requested`}
                    </p>
                    
                    {fansData.users.length > 0 && (
                      <div className="space-y-1">
                        {fansData.users.map((fan) => (
                          <div key={fan.id} className="text-sm">
                            <Link href={`/member/${fan.id}`} className="text-primary hover:underline">
                              {fan.id === user.id ? 'You' : fan.name}
                            </Link>
                            {fan.location && <span className="text-muted-foreground"> in {fan.location}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {!frag.isFan && !ownsIt && !frag.isStatic && (
                      <div className="space-y-2">
                        {isDbtc && (
                          <p className="text-sm text-muted-foreground">
                            Have you read the{' '}
                            <a 
                              href="https://bareefers.org/forum/threads/dbtc-info-rules.23030/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              DBTC rules
                            </a>
                            ?
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Understand that requesting doesn&apos;t guarantee you&apos;ll get one, and this is not first-come, first-served.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="confirm" 
                            checked={requestConfirmed}
                            onCheckedChange={(checked) => setRequestConfirmed(checked as boolean)}
                          />
                          <Label htmlFor="confirm" className="text-sm">
                            Yes, I understand and have suitable conditions
                          </Label>
                        </div>
                        <Button
                          disabled={!requestConfirmed}
                          onClick={handleBecomeFan}
                          className="w-full"
                        >
                          Request a Frag
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Oops Dialog */}
      <Dialog open={oopsDialogOpen} onOpenChange={setOopsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{frag.name}</DialogTitle>
            <DialogDescription>
              Describe the problem with this item and we&apos;ll get back to you.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={oopsNotes}
            onChange={(e) => setOopsNotes(e.target.value)}
            rows={6}
            placeholder="Describe the issue..."
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOopsDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleOopsSubmit} 
              disabled={!oopsNotes}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {frag.name}</DialogTitle>
            <DialogDescription>
              All current details about this item will be publicly visible
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              {shareLink ? (
                <Input
                  value={shareLink}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
              ) : (
                <p>Generating link...</p>
              )}
            </AlertDescription>
          </Alert>
          <Button onClick={() => setShareDialogOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
