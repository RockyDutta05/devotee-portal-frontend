import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({ message = 'An unexpected error occurred.' }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h3 className="mt-4 text-lg font-semibold text-gray-900">Oops! Something went wrong.</h3>
      <p className="mt-2 text-sm text-gray-600 text-center max-w-md">{message}</p>
    </div>
  );
}
