export function Highlight({ color }: { color?: string }) {
  if (!color) return null
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute start-0 top-0 z-0 h-screen w-full opacity-25'
      style={{ backgroundImage: `linear-gradient(${color},transparent)` }}
    />
  )
}
