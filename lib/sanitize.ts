/** Sanitise untrusted user text BEFORE it enters a prompt (Security axis, defence-in-depth):
 *  drop control chars (keeping tab/newline/CR), code-fence / prompt-break attempts, and script
 *  tags, then cap length. Kept in its own module so the one flow depends only on what it uses. */
export function sanitizeInput(raw: string, maxLen = 4000): string {
  const noCtrl = Array.from(raw)
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 127);
    })
    .join("");
  return noCtrl
    .replace(/```+/g, "")
    .replace(/<\/?script[^>]*>/gi, "")
    .slice(0, maxLen)
    .trim();
}
