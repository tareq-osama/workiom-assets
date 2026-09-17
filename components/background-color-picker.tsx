'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  BRAND_GRADIENT,
  COLOR_WHITE,
  COLOR_LIGHT_GRAY,
  COLOR_BLACK,
  COLOR_NAVY,
  COLOR_DARK_PURPLE,
  COLOR_PURPLE,
} from '@/lib/brand';

const NONE = { name: 'None', value: '' };
const GRADIENT = { name: 'Brand Gradient', value: BRAND_GRADIENT };

const LIGHT_PRESETS = [
  { name: COLOR_WHITE.name, value: COLOR_WHITE.hex },
  { name: COLOR_LIGHT_GRAY.name, value: COLOR_LIGHT_GRAY.hex },
];

const DARK_PRESETS = [
  { name: COLOR_BLACK.name, value: COLOR_BLACK.hex },
  { name: COLOR_NAVY.name, value: COLOR_NAVY.hex },
  { name: COLOR_DARK_PURPLE.name, value: COLOR_DARK_PURPLE.hex },
  { name: COLOR_PURPLE.name, value: COLOR_PURPLE.hex },
];

const ALL_PRESETS = [NONE, ...LIGHT_PRESETS, ...DARK_PRESETS, GRADIENT];

const CHECKER_STYLE = {
  backgroundImage:
    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%), linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 4px 4px',
};

function Swatch({
  name,
  value,
  selected,
  dark,
  onSelect,
}: {
  name: string;
  value: string;
  selected: boolean;
  dark: boolean;
  onSelect: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onSelect}
        className={cn(
          'relative h-8 w-8 rounded-md border flex items-center justify-center transition-shadow cursor-pointer',
          selected ? 'ring-2 ring-ring ring-offset-1' : 'border-slate-200 hover:border-slate-300'
        )}
        style={value ? { background: value } : CHECKER_STYLE}
      >
        {selected && <Check className={cn('h-3.5 w-3.5', dark ? 'text-white' : 'text-slate-700')} />}
      </TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  );
}

export default function BackgroundColorPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const preset = ALL_PRESETS.find((p) => p.value.toLowerCase() === value.toLowerCase());
  const label = preset ? preset.name : 'None';

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer',
          className
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <span
            className="h-4 w-4 flex-shrink-0 rounded-sm border border-slate-200"
            style={value ? { background: value } : CHECKER_STYLE}
          />
          <span className={cn('truncate', !value && 'text-muted-foreground')}>{label}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 space-y-3">
        <div className="flex items-center gap-2">
          <Swatch name={NONE.name} value={NONE.value} selected={value === NONE.value} dark={false} onSelect={() => select(NONE.value)} />
          <Separator orientation="vertical" className="h-6" />
          {LIGHT_PRESETS.map((p) => (
            <Swatch key={p.name} name={p.name} value={p.value} selected={value === p.value} dark={false} onSelect={() => select(p.value)} />
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Dark</p>
          <div className="flex items-center gap-2">
            {DARK_PRESETS.map((p) => (
              <Swatch key={p.name} name={p.name} value={p.value} selected={value === p.value} dark onSelect={() => select(p.value)} />
            ))}
          </div>
        </div>

        <Separator />

        <Tooltip>
          <TooltipTrigger
            type="button"
            onClick={() => select(GRADIENT.value)}
            className={cn(
              'relative flex h-9 w-full items-center justify-center rounded-md border text-xs font-medium text-white transition-shadow cursor-pointer',
              value === GRADIENT.value ? 'ring-2 ring-ring ring-offset-1' : 'border-slate-200 hover:border-slate-300'
            )}
            style={{ background: GRADIENT.value }}
          >
            {value === GRADIENT.value && <Check className="h-3.5 w-3.5 mr-1.5" />}
            {GRADIENT.name}
          </TooltipTrigger>
          <TooltipContent>{GRADIENT.name}</TooltipContent>
        </Tooltip>
      </PopoverContent>
    </Popover>
  );
}
