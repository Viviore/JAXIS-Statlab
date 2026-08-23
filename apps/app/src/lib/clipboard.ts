/**
 * Robust, cross-browser clipboard utility with legacy textarea fallback.
 * Works seamlessly in secure contexts, iframes, and local dev environments.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to execCommand if navigator.clipboard fails/is blocked
  }

  try {
    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    }
  } catch {
    // Both attempts failed
  }

  return false;
}
