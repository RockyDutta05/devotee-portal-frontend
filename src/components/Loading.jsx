import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-orange-600">
      <Loader2 className="h-10 w-10 animate-spin" />
      <p className="mt-4 text-sm font-medium text-gray-600">Loading...</p>
    </div>
  );
}
