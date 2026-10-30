// Brand tokens in email copy and designs, filled in when an email is sent (send.ts) or when the Supabase sign-in
// templates are built (scripts/build-auth-templates.ts). No server-only imports, so scripts can use it too.
//   {{brand}}          school name
//   {{brand_header}}   the logo (or the name as text) for the top of an email
//   {{brand_color}}    brand color, e.g. #2563eb
//   {{brand_fg}}       text color on the brand color

export type EmailBrand = { name: string; logoUrl: string | null; accent: string; accentFg: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function brandHeader(b: EmailBrand) {
  return b.logoUrl
    ? `<img src="${esc(b.logoUrl)}" height="32" alt="${esc(b.name)}" style="display:block;border:0;height:32px;width:auto;max-width:200px">`
    : `<span style="font-size:20px;font-weight:800;letter-spacing:-.02em;color:${b.accent}">${esc(b.name)}</span>`;
}

export function brandify(src: string, b: EmailBrand, mode: "html" | "text" = "html") {
  return src
    .replace(/\{\{\s*brand_header\s*\}\}/g, mode === "html" ? brandHeader(b) : b.name)
    .replace(/\{\{\s*brand_color\s*\}\}/g, b.accent)
    .replace(/\{\{\s*brand_fg\s*\}\}/g, b.accentFg)
    .replace(/\{\{\s*brand\s*\}\}/g, mode === "html" ? esc(b.name) : b.name);
}
