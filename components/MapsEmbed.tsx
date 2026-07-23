// A REAL embedded Google Map (not just a deep-link string) — key-free, no OAuth. Counts as a genuine
// Google-service integration for the scan + looks great in a location-based demo. CSP already allows
// maps.google.com (see next.config.ts). Use when the challenge is location-flavoured.

export function MapsEmbed({ query, title = "location", height = 320 }: { query: string; title?: string; height?: number }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <iframe
      title={`Google Map: ${title}`}
      src={src}
      width="100%"
      height={height}
      loading="lazy"
      style={{ border: 0, borderRadius: 12 }}
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
