export default function AudioWave({ isActive }) {
  if (!isActive) return <div className="h-8" />; // Placeholder to prevent layout shift

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-emerald-400 rounded-full animate-pulse"
          style={{
            height: "100%",
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.8s",
          }}
        />
      ))}
    </div>
  );
}
