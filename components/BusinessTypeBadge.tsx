type BusinessType = 'tech' | 'local' | 'content' | 'other';

const BUSINESS_TYPE_CONFIG: Record<
  BusinessType,
  { label: string; color: string; border: string; bg: string }
> = {
  tech:    { label: 'TECH',    color: 'text-[#3B82F6]', border: 'border-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
  local:   { label: 'LOCAL',   color: 'text-[#F59E0B]', border: 'border-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  content: { label: 'CONTENT', color: 'text-[#A855F7]', border: 'border-[#A855F7]', bg: 'bg-[#A855F7]/10' },
  other:   { label: 'OTHER',   color: 'text-[#6B7280]', border: 'border-[#6B7280]', bg: 'bg-[#6B7280]/10' },
};

interface Props {
  type: BusinessType | null | undefined;
  size?: 'sm' | 'default';
}

export default function BusinessTypeBadge({ type, size = 'default' }: Props) {
  if (!type) return null;

  const config = BUSINESS_TYPE_CONFIG[type];
  if (!config) return null;

  const padding = size === 'sm' ? 'px-1.5 py-0' : 'px-2 py-0.5';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <span
      className={`inline-flex items-center border font-bold uppercase tracking-widest font-mono ${padding} ${textSize} ${config.color} ${config.border} ${config.bg}`}
    >
      [ {config.label} ]
    </span>
  );
}
