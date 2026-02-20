'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Box, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SelectOption = { value: number; text: string };
type TableHeader = { text: string; value: string };
type TableAction = { name: string; params: Record<string, unknown> };
type TableRow = Record<string, string | number | undefined> & { key?: string };
type DialogElement = { value: string; text: string; type: string; items?: SelectOption[] };

export default function AdminEquipmentPage() {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    params: Record<string, unknown>;
    elements: DialogElement[];
  } | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [dialogError, setDialogError] = useState<string | null>(null);

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get('/impersonate');
      return data;
    },
  });

  const { data: toolSelect } = useQuery({
    queryKey: ['admin', 'tool', 'equipment'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ select: { name: string; items: SelectOption[] } }>('/admin/tool/equipment');
      return data.select;
    },
    enabled: !!userData?.canImpersonate,
  });

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ['admin', 'table', 'equipment', selectedItemId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        table: { headers: TableHeader[]; items: TableRow[]; actions: TableAction[] };
      }>(`/admin/table/equipment/${selectedItemId}`);
      return data.table;
    },
    enabled: !!userData?.canImpersonate && !!selectedItemId,
  });

  const runAction = useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const { data } = await apiClient.post<{
        title?: string;
        params?: Record<string, unknown>;
        elements?: DialogElement[];
        error?: string;
      }>('/admin/action/equipment/', params);
      return data;
    },
    onSuccess: (data) => {
      if (data.error) {
        setDialogError(data.error);
        return;
      }
      if (data.title && data.elements) {
        setDialogConfig({
          title: data.title,
          params: data.params || {},
          elements: data.elements,
        });
        setFormValues({});
        setDialogError(null);
        setDialogOpen(true);
      }
    },
  });

  const submitDialog = useMutation({
    mutationFn: async (submit: Record<string, unknown>) => {
      const { data } = await apiClient.post<{ table?: unknown; error?: string }>('/admin/dialog/equipment', {
        params: dialogConfig?.params,
        submit,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.error) {
        setDialogError(data.error);
        return;
      }
      setDialogOpen(false);
      setDialogConfig(null);
      setDialogError(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'table', 'equipment', selectedItemId] });
    },
  });

  const handleSubmit = () => {
    const submit: Record<string, unknown> = {};
    for (const el of dialogConfig?.elements || []) {
      const v = formValues[el.value];
      if (el.type === 'userid' && v !== undefined) submit[el.value] = { id: Number(v) };
      else if (el.type === 'select' && v !== undefined) submit[el.value] = v;
      else if (v !== undefined) submit[el.value] = v;
    }
    submitDialog.mutate(submit);
  };

  if (!userData?.canImpersonate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Admin
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Box className="h-8 w-8" /> Equipment queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Select an item to see who&apos;s in line and add/remove/transfer.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Select equipment item</CardTitle>
            <CardDescription>
              {toolSelect?.name || 'Item'} — choose one to manage its queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedItemId ?? ''} onValueChange={(v) => setSelectedItemId(v || null)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Choose an item..." />
              </SelectTrigger>
              <SelectContent>
                {toolSelect?.items?.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedItemId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Queue</CardTitle>
              <CardDescription>
                Users in line; add, remove, or transfer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tableLoading && <p className="text-muted-foreground">Loading...</p>}
              {!tableLoading && tableData && (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tableData.actions?.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => runAction.mutate(action.params)}
                        disabled={runAction.isPending}
                      >
                        {action.name}
                      </Button>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {tableData.headers?.map((h) => (
                            <th key={h.value} className="text-left py-2 px-2 font-medium">
                              {h.text}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.items?.length === 0 && (
                          <tr>
                            <td colSpan={tableData.headers?.length ?? 1} className="py-4 text-muted-foreground text-center">
                              No one in queue
                            </td>
                          </tr>
                        )}
                        {tableData.items?.map((row) => (
                          <tr key={row.key ?? row.userName ?? row.userId} className="border-b">
                            {tableData.headers?.map((h) => (
                              <td key={h.value} className="py-2 px-2">
                                {row[h.value] ?? '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogConfig?.title}</DialogTitle>
            <DialogDescription>
              {dialogError && <span className="text-destructive">{dialogError}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {dialogConfig?.elements?.map((el) => (
              <div key={el.value}>
                <Label htmlFor={el.value}>{el.text}</Label>
                {el.type === 'select' && el.items && (
                  <Select
                    value={String(formValues[el.value] ?? '')}
                    onValueChange={(v) => setFormValues((prev) => ({ ...prev, [el.value]: v }))}
                  >
                    <SelectTrigger id={el.value} className="mt-1">
                      <SelectValue placeholder={`Select ${el.text}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {el.items.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {(el.type === 'text' || el.type === 'userid') && (
                  <Input
                    id={el.value}
                    type={el.type === 'userid' ? 'number' : 'text'}
                    className="mt-1"
                    value={String(formValues[el.value] ?? '')}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [el.value]: el.type === 'userid' ? e.target.valueAsNumber : e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitDialog.isPending}>
              {submitDialog.isPending ? 'Saving...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
