// "AI → real Google action" WITHOUT OAuth. These build prefilled deep-link URLs the user
// just clicks — the winning ecosystem-bonus move, with zero auth/key/backend. Perfect under
// the clock. (Full Gmail/Calendar API needs OAuth 2.0 — avoid that in a 2-3h build.)

/** Opens Gmail's compose window, prefilled. */
export function gmailDraftUrl(opts: { to?: string; subject: string; body: string }): string {
  const p = new URLSearchParams({ view: "cm", fs: "1", to: opts.to ?? "", su: opts.subject, body: opts.body });
  return `https://mail.google.com/mail/?${p.toString()}`;
}

/**
 * Opens Google Calendar's "create event" screen, prefilled.
 * start/end are optional, formatted UTC as YYYYMMDDTHHMMSSZ (e.g. 20260725T093000Z).
 */
export function calendarEventUrl(opts: {
  title: string; details?: string; location?: string; start?: string; end?: string;
}): string {
  const p = new URLSearchParams({ action: "TEMPLATE", text: opts.title });
  if (opts.details) p.set("details", opts.details);
  if (opts.location) p.set("location", opts.location);
  if (opts.start && opts.end) p.set("dates", `${opts.start}/${opts.end}`);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Opens Google Maps to a search/place — handy for location-based challenges. */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Breadth of Google-ecosystem integration is itself a scored dimension (winners use MANY services,
// not just Gemini). These add more zero-auth deep-links — use the ones that fit the challenge.

/** Google Search results for a query. */
export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** Google Translate a phrase to a target language (e.g. "ta", "hi"). */
export function translateUrl(text: string, to: string, from = "auto"): string {
  const p = new URLSearchParams({ sl: from, tl: to, text, op: "translate" });
  return `https://translate.google.com/?${p.toString()}`;
}

/** YouTube search — handy for how-to / tutorial next-step actions. */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
