'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const CLASSIC_URL = 'https://barcode.bareefers.org';

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-[60] bg-amber-500 text-amber-950 text-sm">
      <div className="container flex items-center justify-center gap-3 px-3 py-2 pr-10 sm:px-4">
        <p className="text-center font-medium leading-snug">
          BARcode 2.0 beta — same data as classic.{' '}
          <a
            href={CLASSIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 font-semibold hover:text-amber-900"
          >
            Open classic BARcode
          </a>
          {' '}if something looks off. Feedback welcome on the forum.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-amber-600/30"
          aria-label="Dismiss beta notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
