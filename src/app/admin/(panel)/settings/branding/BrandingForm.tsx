"use client";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Moon, Sun, Trash2 } from "lucide-react";
import { useToast } from "@/components/dash/useToast";
import { Select } from "@/components/dash/Select";
import { uploadFile } from "@/lib/upload-client";
import { FONTS, brandCss, isHex, type FontKey } from "@/lib/brand-shared";
import { saveBranding, setBrandImage } from "../actions";

type Initial = {
  name: string;
  tagline: string;
  emailFromName: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  iconUrl: string | null;
  accent: string;
  accentFg: string;
  themeDefault: "light" | "dark";
  font: FontKey;
};

const SWATCHES = ["#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0d9488", "#0891b2", "#111827"];
const IMAGES = [
  { field: "logo_url", prop: "logoUrl", label: "Logo", hint: "Shown on light backgrounds. PNG or WebP with a transparent background, about 400 × 100 px.", dark: false },
  { field: "logo_dark_url", prop: "logoDarkUrl", label: "Logo for dark backgrounds", hint: "Optional. A light version of the logo for dark mode and dark headers.", dark: true },
  { field: "icon_url", prop: "iconUrl", label: "Icon", hint: "Square, at least 512 × 512 px. Used as the favicon, app icon and collapsed sidebar mark.", dark: false },
] as const;

// Admin > Settings > Branding. Changes show in the preview straight away and reach every page once saved.
export function BrandingForm({ initial }: { initial: Initial }) {
  const [toast, show] = useToast();
  const [saving, start] = useTransition();
  const [v, setV] = useState(initial);
  const set = <K extends keyof Initial>(k: K, val: Initial[K]) => setV((x) => ({ ...x, [k]: val }));
  const accentOk = isHex(v.accent) && isHex(v.accentFg);

  function save() {
    if (!accentOk) return show({ error: "Colors must be hex codes like #2563eb." });
    start(async () => show((await saveBranding({ name: v.name, tagline: v.tagline, emailFromName: v.emailFromName, accent: v.accent, accentFg: v.accentFg, themeDefault: v.themeDefault, font: v.font })) ?? {}));
  }

  return (
    <>
      {toast}
      {/* Live preview of the colors and font, scoped to this page until saved. */}
      {accentOk && <style>{brandCss({ accent: v.accent, accentFg: v.accentFg, font: v.font }).replace(":root", ".sc-brand-preview")}</style>}

      <section className="et-card">
        <div className="et-card-head">
          <h2>Name</h2>
        </div>
        <div className="et-card-pad et-form-grid">
          <div className="et-field">
            <label htmlFor="b-name">School or brand name</label>
            <input id="b-name" value={v.name} maxLength={60} onChange={(e) => set("name", e.target.value)} />
            <small>Used in page titles, emails, certificates and the wordmark until a logo is uploaded.</small>
          </div>
          <div className="et-field">
            <label htmlFor="b-from">Email sender name</label>
            <input id="b-from" value={v.emailFromName} maxLength={60} placeholder={v.name} onChange={(e) => set("emailFromName", e.target.value)} />
            <small>What learners see as the sender. Leave empty to use the name.</small>
          </div>
          <div className="et-field et-field-wide">
            <label htmlFor="b-tagline">Tagline</label>
            <input id="b-tagline" value={v.tagline} maxLength={160} placeholder="Learn at your own pace and earn certificates you can share." onChange={(e) => set("tagline", e.target.value)} />
            <small>The default description for search engines and link previews.</small>
          </div>
        </div>
      </section>

      <section className="et-card">
        <div className="et-card-head">
          <h2>Logo and icon</h2>
          <span className="et-muted" style={{ fontSize: 12.5 }}>
            Each image saves as soon as it uploads
          </span>
        </div>
        <div className="et-card-pad sc-brand-images">
          {IMAGES.map(({ prop, ...img }) => (
            <ImageField key={img.field} {...img} url={v[prop]} onChange={(url) => set(prop, url)} onMessage={show} />
          ))}
        </div>
      </section>

      <section className="et-card">
        <div className="et-card-head">
          <h2>Colors, font and theme</h2>
        </div>
        <div className="et-card-pad et-form-grid">
          <div className="et-field">
            <label htmlFor="b-accent">Brand color</label>
            <div className="sc-color">
              <input type="color" aria-label="Pick brand color" value={isHex(v.accent) ? v.accent : "#2563eb"} onChange={(e) => set("accent", e.target.value)} />
              <input id="b-accent" value={v.accent} maxLength={7} onChange={(e) => set("accent", e.target.value.trim())} />
            </div>
            <div className="sc-swatches">
              {SWATCHES.map((c) => (
                <button key={c} type="button" style={{ background: c }} aria-label={`Use ${c}`} className={v.accent.toLowerCase() === c ? "is-on" : ""} onClick={() => set("accent", c)} />
              ))}
            </div>
            <small>Buttons, links, highlights and progress bars. Lighter and darker shades are worked out from it.</small>
          </div>
          <div className="et-field">
            <label htmlFor="b-fg">Text on brand color</label>
            <div className="sc-color">
              <input type="color" aria-label="Pick text color" value={isHex(v.accentFg) ? v.accentFg : "#ffffff"} onChange={(e) => set("accentFg", e.target.value)} />
              <input id="b-fg" value={v.accentFg} maxLength={7} onChange={(e) => set("accentFg", e.target.value.trim())} />
            </div>
            <small>Usually white. Use a dark color if the brand color is very light (yellow, lime).</small>
          </div>
          <div className="et-field">
            <label htmlFor="b-font">Font</label>
            <Select id="b-font" value={v.font} onChange={(e) => set("font", e.target.value as FontKey)}>
              {Object.entries(FONTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="et-field">
            <label>Default theme</label>
            <div className="et-seg" role="radiogroup" aria-label="Default theme">
              <button type="button" role="radio" aria-checked={v.themeDefault === "light"} className={v.themeDefault === "light" ? "is-on" : ""} onClick={() => set("themeDefault", "light")}>
                <Sun size={13} /> Light
              </button>
              <button type="button" role="radio" aria-checked={v.themeDefault === "dark"} className={v.themeDefault === "dark" ? "is-on" : ""} onClick={() => set("themeDefault", "dark")}>
                <Moon size={13} /> Dark
              </button>
            </div>
            <small>What visitors see first. Everyone can still switch with the theme toggle.</small>
          </div>
        </div>
        <div className="et-card-pad">
          <p className="et-section-label">Preview</p>
          <div className="sc-brand-preview">
            <div className="sc-preview-bar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {v.logoUrl ? <img src={v.logoUrl} alt="" /> : <span className="sc-wordmark">{v.name || "Your school"}</span>}
              <span className="sc-preview-btn">Enroll now</span>
            </div>
            <p>
              Lessons, quizzes and a certificate at the end. <a href="#preview">A link looks like this.</a>
            </p>
            <div className="sc-preview-progress">
              <span style={{ width: "62%" }} />
            </div>
          </div>
        </div>
        <div className="et-form-foot et-card-pad">
          <button type="button" className="et-btn et-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save branding"}
          </button>
        </div>
      </section>
    </>
  );
}

function ImageField({
  field,
  label,
  hint,
  dark,
  url,
  onChange,
  onMessage,
}: {
  field: "logo_url" | "logo_dark_url" | "icon_url";
  label: string;
  hint: string;
  dark: boolean;
  url: string | null;
  onChange: (url: string | null) => void;
  onMessage: (m: { ok?: string; error?: string }) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File) {
    setBusy(true);
    try {
      const up = await uploadFile("brand", file, file.name);
      const res = await setBrandImage(field, up.url);
      if (res?.error) onMessage(res);
      else {
        onChange(up.url);
        onMessage({ ok: `${label} updated.` });
      }
    } catch (e) {
      onMessage({ error: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    const res = await setBrandImage(field, null);
    setBusy(false);
    if (res?.error) return onMessage(res);
    onChange(null);
  }

  return (
    <div className="et-field">
      <label>{label}</label>
      <div className={`sc-brand-slot${dark ? " is-dark" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" /> : <span className="et-muted">None yet</span>}
      </div>
      <small>{hint}</small>
      <div className="et-inline">
        <button type="button" className="et-btn et-btn-ghost et-btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          <ImagePlus size={14} /> {busy ? "Working…" : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button type="button" className="et-btn et-btn-ghost et-btn-sm" disabled={busy} onClick={clear}>
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept=".png,.webp,.jpg,.jpeg"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void pick(f);
        }}
      />
    </div>
  );
}
