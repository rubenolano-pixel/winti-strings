export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-3">🎾</div>
        <p className="text-gray-400 text-sm">Wird geladen…</p>
      </div>
    </div>
  )
}
