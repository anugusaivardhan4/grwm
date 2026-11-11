export function EmptyState({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface/50 px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-soft text-3xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-muted">{text}</p>
    </div>
  );
}
