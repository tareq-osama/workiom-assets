'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HeroSearch() {
  const [value, setValue] = useState('');
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/?search=${encodeURIComponent(value.trim())}`);
    } else {
      router.push('/');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search logos, templates, brand assets..."
          className="pl-10 h-12 text-base bg-white border-slate-200 shadow-sm focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 px-6 bg-[#4E86F7] hover:bg-[#3a72e3] text-white font-medium"
      >
        Search
      </Button>
    </form>
  );
}
