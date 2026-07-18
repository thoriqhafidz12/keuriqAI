interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Card({
  children,
  className = '',
  padding = 'p-6',
  onClick,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${padding} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
