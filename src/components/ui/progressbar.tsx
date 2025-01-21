export function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
      <div
        className="
          bg-brand-primary-950
          h-2
          transition-all
          duration-500
        "
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
