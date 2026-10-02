'use client';

import { AdminToolPage } from '@/components/admin/admin-tool-page';
import { Users } from 'lucide-react';

export default function AdminHoldersPage() {
  return (
    <AdminToolPage
      toolName="holders"
      title="Equipment holders"
      description="Who is allowed to hold club equipment, and their home location."
      icon={<Users className="h-8 w-8" />}
    />
  );
}
