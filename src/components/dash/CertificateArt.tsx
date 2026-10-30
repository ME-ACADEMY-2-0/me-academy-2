"use client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useBrand } from "@/components/brand/BrandProvider";
import type { Certificate } from "@/lib/data/certificates";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// The certificate itself. Every size is in container units (cqw), so the same markup renders as a
// thumbnail in the Certificates tab, full size on the public page, and one A4 page when printed.
export function CertificateArt({ cert, site, signer }: { cert: Certificate; site: string; signer?: { name: string; title: string } }) {
  // Courses with a tutor are signed by the tutor; otherwise by the admin-set signer (Admin > Settings > Learning).
  const brand = useBrand();
  const sign = cert.instructorName ? { name: cert.instructorName, title: "Course instructor" } : (signer ?? { name: `The ${brand.name} team`, title: brand.name });
  const ring = `cx-ring-${cert.code}`;
  return (
    <div className="et-cx" role="img" aria-label={`${brand.name} certificate: ${cert.recipientName} completed ${cert.courseTitle}, ${fmt(cert.issuedAt)}, ID ${cert.code}`}>
      <div className="et-cx-paper">
        <div className="et-cx-band">
          <BrandLogo className="et-cx-logo" />
          <span className="et-cx-band-tag">Certificate of completion</span>
        </div>

        <svg className="et-cx-seal" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path id={ring} d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
          </defs>
          <circle cx="60" cy="60" r="58" fill="#ffffff" />
          <circle cx="60" cy="60" r="54" fill="none" stroke="#7c3aed" strokeWidth="2.2" />
          <circle cx="60" cy="60" r="31" fill="none" stroke="#7c3aed" strokeWidth="1.2" />
          {/* textLength stretches the phrase to exactly one lap of the ring (2π × 43 ≈ 270). */}
          <text fill="#6d28d9" fontSize="10" fontWeight="800">
            <textPath href={`#${ring}`} startOffset="0" textLength="268" lengthAdjust="spacing">
              {`${brand.name.toUpperCase()} · CERTIFIED ·`}
            </textPath>
          </text>
          {brand.iconUrl ? <image href={brand.iconUrl} x="44" y="44" width="32" height="32" /> : <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill="#6d28d9">{brand.name.charAt(0).toUpperCase()}</text>}
        </svg>

        <div className="et-cx-body">
          <div className="et-cx-field et-cx-name">
            <b>{cert.recipientName}</b>
            <span>Learner</span>
          </div>

          <p className="et-cx-lead">has successfully completed</p>
          <h3 className="et-cx-course">{cert.courseTitle}</h3>

          <div className="et-cx-row">
            <div className="et-cx-field">
              <b>{fmt(cert.issuedAt)}</b>
              <span>Date</span>
            </div>
            <div className="et-cx-field">
              <b>{cert.code}</b>
              <span>Certificate ID</span>
            </div>
          </div>

          <div className="et-cx-field et-cx-sign">
            <i>{sign.name}</i>
            <b>{sign.name}</b>
            <span>{sign.title}</span>
          </div>
        </div>

        <p className="et-cx-verify">Verify at {site.replace(/^https?:\/\//, "")}/certificate/{cert.code}</p>
      </div>
    </div>
  );
}
