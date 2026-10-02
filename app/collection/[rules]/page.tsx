import { Suspense } from 'react';
import RulesCollectionClient from './rules-collection-client';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <RulesCollectionClient />
    </Suspense>
  );
}
