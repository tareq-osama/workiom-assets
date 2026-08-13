import type { ReactNode } from 'react';

export function Slide({
  children,
  background = '#FFFFFF',
  dark = false,
  className = '',
}: {
  children: ReactNode;
  background?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`relative w-[1600px] h-[900px] shrink-0 overflow-hidden break-after-page flex flex-col px-20 py-14 ${
        dark ? 'text-white' : 'text-slate-900'
      } ${className}`}
      style={{ background }}
    >
      {children}
    </section>
  );
}

export function SlideHeader({
  section,
  page,
  dark = false,
}: {
  section: string;
  page: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm tracking-wide pb-5 mb-10 border-b ${
        dark ? 'border-white/15 text-white/50' : 'border-[#EDEDED] text-slate-400'
      }`}
    >
      <span className="flex items-center gap-2.5 font-medium">
        <span className={`h-3 w-3 rounded-full ${dark ? 'bg-white' : 'bg-[#9635F0]'}`} />
        Brand Guidelines
      </span>
      <span className="font-medium">{section}</span>
      <span className="font-mono">{page}</span>
    </div>
  );
}
