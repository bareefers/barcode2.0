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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SelectOption = { value: number | string; text: string };
type TableHeader = { text: string; value: string };
type TableAction = { name: string; params: Record<string, unknown> };
type TableRow = Record<string, string | number | undefined> & { key?: string };
type DialogElement = { value: string; text: string; type: string; items?: SelectOption[] };

type AdminUser = {
  canModerate?: boolean;
  canImpersonate?: boolean;
  isAdmin?: boolean;
  isMod?: boolean;
};

export function AdminToolPage({
  toolName,
  title,
  description,
  /** When true, show a dropdown first (equipment). When false, load table with value "0". */
  needsSelect = false,
  icon,
}: {
  toolName: string;
  title: string;
  description: string;
  needsSelect?: boolean;
  icon?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(needsSelect ? null : '0');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    params: Record<string, unknown>;
    elements: DialogElement[];
  } | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUser>('/impersonate');
      return data;
    },
  });

  const canAccess = Boolean(userData?.canModerate || userData?.canImpersonate || userData?.isAdmin || userData?.isMod);

  const { data: toolSelect } = useQuery({
    queryKey: ['admin', 'tool', toolName],
    queryFn: async () => {
      const { data } = await apiClient.get<{ select: { name: string; items: SelectOption[] } | null | undefined }>(
        `/admin/tool/${toolName}`
      );
      return data.select;
    },
    enabled: canAccess && needsSelect,
  });

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ['admin', 'table', toolName, selectedId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        table: { headers: TableHeader[]; items: TableRow[]; actions: TableAction[] };
      }>(`/admin/table/${toolName}/${selectedId}`);
      return data.table;
    },
    enabled: canAccess && !!selectedId,
  });

  const { data: userSuggestions } = useQuery({
    queryKey: ['find-users', userQuery],
    queryFn: async () => {
      const { data } = await apiClient.get<{ users: [number, string][] }>('/dbtc/find-users', {
        params: { prefix: userQuery, all: 'true' },
      });
      return data.users.map(([id, name]) => ({ id, name }));
    },
    enabled: dialogOpen && userQuery.trim().length >= 2,
  });

  const runAction = useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const { data } = await apiClient.post<{
        title?: string;
        params?: Record<string, unknown>;
        elements?: DialogElement[];
        error?: string;
      }>(`/admin/action/${toolName}/`, params);
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
        setUserQuery('');
        setDialogError(null);
        setDialogOpen(true);
      }
    },
  });

  const submitDialog = useMutation({
    mutationFn: async (submit: Record<string, unknown>) => {
      const { data } = await apiClient.post<{ table?: unknown; error?: string }>(`/admin/dialog/${toolName}`, {
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'table', toolName, selectedId] });
    },
  });

  const handleSubmit = () => {
    const submit: Record<string, unknown> = {};
    for (const el of dialogConfig?.elements || []) {
      const v = formValues[el.value];
      if (el.type === 'userid' && v !== undefined && v !== '') {
        submit[el.value] = { id: Number(v) };
      } else if (el.type === 'select' && v !== undefined && v !== '') {
        // numeric select values (user ids) as numbers when possible
        const n = Number(v);
        submit[el.value] = Number.isFinite(n) && String(n) === String(v) ? n : v;
      } else if (v !== undefined && v !== '') {
        submit[el.value] = v;
      }
    }
    submitDialog.mutate(submit);
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Forum moderators and BARcode admins only.</p>
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
            {icon}
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {needsSelect && (
          <Card>
            <CardHeader>
              <CardTitle>Select {toolSelect?.name || 'item'}</CardTitle>
              <CardDescription>Choose one to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedId ?? ''} onValueChange={(v) => setSelectedId(v || null)}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {toolSelect?.items?.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {selectedId && (
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
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
                              No rows
                            </td>
                          </tr>
                        )}
                        {tableData.items?.map((row, idx) => (
                          <tr key={String(row.key ?? idx)} className="border-b">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {el.type === 'userid' && (
                  <div className="mt-1 space-y-2">
                    {formValues[el.value] ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">User ID: {formValues[el.value]}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFormValues((p) => ({ ...p, [el.value]: '' }))}>
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder="Type member name…"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                        />
                        {userSuggestions && userSuggestions.length > 0 && (
                          <ul className="border rounded-md max-h-40 overflow-y-auto text-sm">
                            {userSuggestions.map((u) => (
                              <li key={u.id}>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-muted"
                                  onClick={() => {
                                    setFormValues((prev) => ({ ...prev, [el.value]: u.id }));
                                    setUserQuery('');
                                  }}
                                >
                                  {u.name} (#{u.id})
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}
                {el.type === 'text' && (
                  <Input
                    id={el.value}
                    className="mt-1"
                    value={String(formValues[el.value] ?? '')}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [el.value]: e.target.value }))}
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
