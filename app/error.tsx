'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 text-sm mb-6">
          An unexpected error occurred. You can try again or head back to the library.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="h-10 px-5"
            onClick={reset}
          >
            Try again
          </Button>
          <Link href="/">
            <Button className="h-10 px-5 bg-[#4E86F7] hover:bg-[#3a72e3] text-white font-medium">
              Back to Assets Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
