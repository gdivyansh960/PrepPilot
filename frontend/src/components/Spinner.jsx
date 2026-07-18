export function Spinner({ className = '' }) {
  return <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  )
}
