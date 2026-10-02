'use client';

import { AdminToolPage } from '@/components/admin/admin-tool-page';
import { Ban } from 'lucide-react';

export default function AdminBansPage() {
  return (
    <AdminToolPage
      toolName="bans"
      title="Equipment bans"
      description="Ban or unban members from the equipment queue."
      icon={<Ban className="h-8 w-8" />}
    />
  );
}
