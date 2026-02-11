'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { EnumsResponse, Frag } from '@/types';

const fragSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  scientificName: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  rules: z.enum(['dbtc', 'pif', 'private']),
  source: z.string().optional(),
  dateAcquired: z.string().optional(),
  light: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  flow: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  hardiness: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'EXPERT']),
  growthRate: z.enum(['SLOW', 'MODERATE', 'FAST']),
  notes: z.string().optional(),
});

type FragFormData = z.infer<typeof fragSchema>;

function AddFragForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fragId = searchParams.get('fragId');
  const isEdit = Boolean(fragId);
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch enums for dropdowns
  const { data: enumsData } = useQuery({
    queryKey: ['enums'],
    queryFn: async () => {
      const { data } = await apiClient.get<EnumsResponse>('/dbtc/enums');
      return data;
    },
  });

  // Fetch existing frag if editing
  const { data: existingFrag, isLoading: loadingFrag } = useQuery({
    queryKey: ['frag', fragId],
    queryFn: async () => {
      if (!fragId) return null;
      const { data } = await apiClient.get<{ user: any; frags: Frag[] }>('/dbtc/your-collection');
      return data.frags?.find((f: Frag) => f.fragId === parseInt(fragId)) || null;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FragFormData>({
    resolver: zodResolver(fragSchema),
    defaultValues: existingFrag ? {
      name: existingFrag.name,
      scientificName: existingFrag.scientificName || '',
      type: existingFrag.type,
      rules: existingFrag.rules,
      source: existingFrag.source || '',
      dateAcquired: existingFrag.dateAcquired || '',
      light: existingFrag.light as any,
      flow: existingFrag.flow as any,
      hardiness: existingFrag.hardiness as any,
      growthRate: existingFrag.growthRate as any,
      notes: existingFrag.notes || '',
    } : {
      rules: 'private',
      light: 'MEDIUM',
      flow: 'MEDIUM',
      hardiness: 'MODERATE',
      growthRate: 'MODERATE',
    },
  });

  const saveFrag = useMutation({
    mutationFn: async (data: FragFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });
      if (imageFile) {
        formData.append('picture', imageFile);
      }
      if (fragId) {
        formData.append('fragId', fragId);
      }

      const endpoint = '/dbtc/add'; // Backend handles both add and edit
      await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      router.push('/collection');
    },
  });

  const onSubmit = (data: FragFormData) => {
    saveFrag.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEdit && loadingFrag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Coral' : 'Add New Coral'}</CardTitle>
            <CardDescription>
              {isEdit ? 'Update your coral information' : 'Add a new coral to your collection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Red Dragon Acro"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Scientific Name */}
              <div>
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input
                  id="scientificName"
                  {...register('scientificName')}
                  placeholder="e.g., Acropora valida"
                />
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
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
                {errors.type && (
                  <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
                )}
              </div>

              {/* Collection Rules */}
              <div>
                <Label htmlFor="rules">Collection *</Label>
                <Select
                  value={watch('rules')}
                  onValueChange={(value) => setValue('rules', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dbtc">DBTC - Don't Break The Chain</SelectItem>
                    <SelectItem value="pif">PIF - Pay It Forward</SelectItem>
                    <SelectItem value="private">Private - Personal Collection</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rules && (
                  <p className="text-sm text-destructive mt-1">{errors.rules.message}</p>
                )}
              </div>

              {/* Source/Origin */}
              <div>
                <Label htmlFor="source">Source/Origin</Label>
                <Input
                  id="source"
                  {...register('source')}
                  placeholder="Where did you get it?"
                />
              </div>

              {/* Date Acquired */}
              <div>
                <Label htmlFor="dateAcquired">Date Acquired</Label>
                <Input
                  id="dateAcquired"
                  type="date"
                  {...register('dateAcquired')}
                />
              </div>

              {/* Conditions Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Light *</Label>
                  <Select
                    value={watch('light')}
                    onValueChange={(value) => setValue('light', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Flow *</Label>
                  <Select
                    value={watch('flow')}
                    onValueChange={(value) => setValue('flow', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hardiness *</Label>
                  <Select
                    value={watch('hardiness')}
                    onValueChange={(value) => setValue('hardiness', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="DIFFICULT">Difficult</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Growth Rate *</Label>
                  <Select
                    value={watch('growthRate')}
                    onValueChange={(value) => setValue('growthRate', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SLOW">Slow</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="FAST">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional notes..."
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="picture">Photo</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {imageFile ? imageFile.name : 'Click to upload image'}
                      </p>
                    </div>
                    <input
                      id="picture"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-4 w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Error */}
              {saveFrag.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to save coral. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveFrag.isPending}
                  className="flex-1"
                >
                  {saveFrag.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? 'Update' : 'Add'} Coral
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AddFragPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AddFragForm />
    </Suspense>
  );
}
