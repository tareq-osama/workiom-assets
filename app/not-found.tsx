import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <Compass className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link href="/">
          <Button className="h-10 px-6 bg-[#4E86F7] hover:bg-[#3a72e3] text-white font-medium">
            Back to Assets Library
          </Button>
        </Link>
      </div>
    </div>
  );
}
