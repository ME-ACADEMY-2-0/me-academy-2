import Link from "next/link";
import { legalDetails } from "../details";

export const metadata = { title: "Terms of Service" };


// STARTER LEGAL TEXT. Generated from Settings > Branding and Settings > Platform; have the client\'s lawyer review it
// before launch (see docs/SETUP.md, stage 7).
export default async function TermsPage() {
  const { name, host, contact } = await legalDetails();
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="et-legal-date">Last updated: [DATE]</p>

      <p>
        These terms govern your use of {host} and the services run by {name} (&quot;we&quot;, &quot;us&quot;). By creating an account or using {name}, you agree to these terms and to our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. Your account</h2>
      <ul>
        <li>You must be at least 13 years old to use {name}. If you are under 18, you need permission from a parent or guardian.</li>
        <li>Give accurate information and keep your password secure. You are responsible for activity on your account.</li>
        <li>Tell us straight away if you think someone else has accessed your account.</li>
      </ul>

      <h2>2. Learning on {name}</h2>
      <p>
        When you enrol in a course, you get a personal, non-transferable right to view it for your own learning. You may not
        copy, share, resell, or publicly redistribute course content, or share your account to give others access.
      </p>

      <h2>3. Course content</h2>
      <p>
        Courses, videos, documents and other materials on {name} belong to {name} or its instructors. You may not copy,
        record, resell or publicly share them.
      </p>

      <h2>4. Payments and refunds</h2>
      <p>
        Prices are shown in naira before you pay. Payments are handled by our payment provider, Paystack, and access is granted once
        the payment is confirmed. Refunds follow our <Link href="/refund-policy">Refund Policy</Link>.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload anything unlawful, harmful, hateful, sexually explicit, or misleading.</li>
        <li>Harass, threaten, or impersonate other people.</li>
        <li>Try to break, overload, or bypass the security of the platform.</li>
        <li>Scrape, download, or record content in ways the platform does not allow.</li>
      </ul>

      <h2>6. Suspension and termination</h2>
      <p>
        We may suspend or close accounts that break these terms or put other users at risk. You can stop using {name} at any
        time and ask us to delete your account.
      </p>

      <h2>7. Our content and brand</h2>
      <p>
        The {name} name, logo, and platform design belong to {name}. You may not use them without our written
        permission.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        Courses are created by independent instructors. We work to keep quality high, but we do not guarantee any particular
        result, job, or qualification from taking a course. {name} is provided &quot;as is&quot; and may sometimes be unavailable
        for maintenance or reasons beyond our control.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the extent the law allows, {name} is not liable for indirect or consequential losses. Our total liability to you for
        any claim is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms. If the changes are significant, we will update the date above and let you know. Continuing
        to use {name} after that means you accept the new terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${contact}`}>{contact}</a>.
      </p>
    </article>
  );
}
