// Complete Tailwind class strings per colour key — must be complete strings so
// Tailwind's scanner can include them in the bundle even when composed at runtime.
export const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; border: string; hover: string; chip: string }
> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',   hover: 'hover:bg-blue-100',   chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', hover: 'hover:bg-indigo-100', chip: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  border: 'border-slate-200',  hover: 'hover:bg-slate-100',  chip: 'bg-slate-50 text-slate-700 border-slate-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', hover: 'hover:bg-violet-100', chip: 'bg-violet-50 text-violet-700 border-violet-200' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-100',   hover: 'hover:bg-pink-100',   chip: 'bg-pink-50 text-pink-700 border-pink-200' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100',   hover: 'hover:bg-teal-100',   chip: 'bg-teal-50 text-teal-700 border-teal-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', hover: 'hover:bg-orange-100', chip: 'bg-orange-50 text-orange-700 border-orange-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100',  hover: 'hover:bg-green-100',  chip: 'bg-green-50 text-green-700 border-green-200' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100',    hover: 'hover:bg-red-100',    chip: 'bg-red-50 text-red-700 border-red-200' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-100',   hover: 'hover:bg-cyan-100',   chip: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', hover: 'hover:bg-yellow-100', chip: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', hover: 'hover:bg-purple-100', chip: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const DEFAULT_COLORS = COLOR_CLASSES.slate;

export function getColorClasses(color: string) {
  return COLOR_CLASSES[color] ?? DEFAULT_COLORS;
}
