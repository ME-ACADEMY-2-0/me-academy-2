import Link from "next/link";
import { legalDetails } from "../details";

export const metadata = {
  title: "Refund Policy",
  description: "When and how you can get a refund for a course.",
  alternates: { canonical: "/refund-policy" },
};


// STARTER LEGAL TEXT. Generated from Settings > Branding and Settings > Platform; have the client\'s lawyer review it
// before launch (see docs/SETUP.md, stage 7).
export default async function RefundPolicyPage() {
  const { name, contact } = await legalDetails();
  return (
    <article>
      <h1>Refund Policy</h1>
      <p className="et-legal-date">Last updated: [DATE]</p>

      <p>
        We want you to be happy with everything you buy on {name}. This policy explains when you can get your money back. It is part of
        our <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>1. Courses</h2>
      <p>You can ask for a full refund on a course within 14 days of buying it, as long as you have completed less than 30% of its lessons.</p>

      <h2>2. When we can&apos;t refund</h2>
      <ul>
        <li>Requests made more than 14 days after purchase, unless the item was faulty or not as described.</li>
        <li>Accounts suspended for breaking our terms, for example by sharing or reselling purchased content.</li>
        <li>Repeated refund requests that suggest the policy is being misused.</li>
        <li>Free items, since nothing was paid.</li>
      </ul>

      <h2>3. How to ask for a refund</h2>
      <p>
        <Link href="/contact">Contact us</Link> and choose &quot;Payment or refund&quot;, or email <a href={`mailto:${contact}`}>{contact}</a>.
        Include the email on your {name} account and the payment reference from your receipt. We reply within two working days.
      </p>

      <h2>4. How refunds are paid</h2>
      <p>
        Approved refunds go back to the card or account you paid with, through our payment provider Paystack. Paystack says refunds
        usually arrive within 3 to 10 working days, depending on your bank. We refund the full amount you paid. Once a refund is made,
        access to the course is removed.
      </p>

      <h2>5. Your legal rights</h2>
      <p>This policy doesn&apos;t limit any rights you have under consumer protection law in Nigeria or where you live.</p>
    </article>
  );
}
