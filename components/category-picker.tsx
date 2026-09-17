'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CategoryIcon } from '@/components/category-icon';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/appwrite-categories';

interface CategoryPickerProps {
  categories: Category[];
  value: string;
  onChange: (name: string) => void;
  onCategoryCreated?: (category: Category) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function CategoryPicker({
  categories,
  value,
  onChange,
  onCategoryCreated,
  placeholder = 'Select category',
  className,
  id,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const selected = categories.find((c) => c.name === value);
  const query = search.trim();
  const hasExactMatch = categories.some(
    (c) => c.name.toLowerCase() === query.toLowerCase()
  );

  async function handleCreate() {
    if (!query || creating) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query }),
      });
      if (!res.ok) throw new Error('Failed to create category');
      const category: Category = await res.json();
      onCategoryCreated?.(category);
      onChange(category.name);
      setOpen(false);
      setSearch('');
    } catch {
      setError('Could not create category. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSearch(''); setError(''); } }}>
      <PopoverTrigger
        id={id}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer',
          className
        )}
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            <CategoryIcon icon={selected.icon} className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            {selected.name}
          </span>
        ) : value ? (
          <span className="truncate">{value}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create category…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandGroup>
              {categories
                .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
                .map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={cat.name}
                    onSelect={() => {
                      onChange(cat.name);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <CategoryIcon icon={cat.icon} className="h-3.5 w-3.5 text-slate-400" />
                    {cat.name}
                    {cat.name === value && <Check className="ml-auto h-3.5 w-3.5" />}
                  </CommandItem>
                ))}
            </CommandGroup>
            {categories.length === 0 && !query && (
              <CommandEmpty>No categories yet.</CommandEmpty>
            )}
            {!hasExactMatch && (
              <CommandGroup>
                <CommandItem
                  value={query ? `__create__${query}` : '__create__'}
                  disabled={creating || !query}
                  onSelect={handleCreate}
                  className="text-blue-600"
                >
                  {creating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {query ? <>Create &quot;{query}&quot;</> : 'Create new category…'}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
          {error && (
            <p className="px-2 pb-2 pt-1 text-xs text-red-600">{error}</p>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
