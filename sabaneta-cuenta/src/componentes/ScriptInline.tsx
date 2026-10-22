/** Script que corre antes de pintar (evita parpadeos). Ver docs de Next: preventing-flash-before-hydration. */
export function ScriptInline({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
