'use client';

import { useState } from 'react';
import { Check, Link2, ImageIcon, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label: string;
  icon?: 'link' | 'image' | 'svg';
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export default function CopyButton({
  value,
  label,
  icon = 'link',
  className,
  variant = 'outline',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = value;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const IconComponent = copied
    ? Check
    : icon === 'link'
    ? Link2
    : icon === 'svg'
    ? Code
    : ImageIcon;

  return (
    <Button
      variant={variant}
      onClick={handleCopy}
      className={cn('gap-2 transition-colors', copied && 'text-green-600 border-green-300', className)}
    >
      <IconComponent className="h-4 w-4" />
      {copied ? 'Copied!' : label}
    </Button>
  );
}
