export function MovieCardSkeleton({ cardWidth = 180 }: { cardWidth?: number }) {
  return (
    <div
      className="skeleton rounded flex-shrink-0"
      style={{ width: cardWidth, height: cardWidth * 1.5 }}
    />
  );
}

export function MovieRowSkeleton({
  count = 7,
}: {
  count?: number;
}) {
  return (
    <div className="mb-8">
      <div className="skeleton h-6 w-48 rounded mb-3 mx-[4%]" />
      <div className="flex gap-2 overflow-hidden px-[4%]">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="hero-banner skeleton" style={{ height: "85vh" }}>
      <div className="absolute bottom-24 left-[4%] space-y-4">
        <div className="skeleton h-16 w-96 rounded" style={{ background: "rgba(255,255,255,0.1)" }} />
        <div className="skeleton h-4 w-80 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="skeleton h-4 w-64 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="flex gap-3 mt-4">
          <div className="skeleton h-12 w-28 rounded" style={{ background: "rgba(255,255,255,0.15)" }} />
          <div className="skeleton h-12 w-32 rounded" style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="skeleton profile-avatar" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  );
}
