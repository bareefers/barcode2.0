'use client';

import { AdminToolPage } from '@/components/admin/admin-tool-page';
import { Box } from 'lucide-react';

export default function AdminEquipmentPage() {
  return (
    <AdminToolPage
      toolName="equipment"
      title="Equipment queue"
      description="Change who is waiting or holding, set location/status, transfer items, and mark returned."
      needsSelect
      icon={<Box className="h-8 w-8" />}
    />
  );
}
