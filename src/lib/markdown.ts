// Minimal, safe Markdown-ish renderer: bold (**text**) and newlines -> <br>/<p>
export function renderSimpleMarkdown(input: string | null | undefined): string {
  if (!input) return '';
  // Normalize newlines
  let text = String(input);

  // If description contains escaped newline sequences (e.g. "\n"), convert them to real newlines
  text = text.replace(/\\r\\n|\\n|\\r/g, '\n');

  // Normalize CRLF to LF
  text = text.replace(/\r\n?/g, '\n');

  // Escape HTML to avoid XSS
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;');

  text = escapeHtml(text);

  // Bold: **text** or __text__ -> <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Paragraphs: split on two or more newlines
  // Split on single newline so that one Enter in the admin becomes one paragraph
  const paragraphs = text.split(/\n/g).map((p) => {
    return `<p class="mb-4">${p}</p>`;
  });

  return paragraphs.join('');
}

export default renderSimpleMarkdown;
