// Help centre content (/help) and the contact form topics. STARTER COPY: adjust the answers to the client's own
// policies (refund window, access period, support hours) before launch.

export const CONTACT_TOPICS = ["General question", "Payment or refund", "Course access", "Certificates", "Report a problem"] as const;

export type HelpTopic = { id: string; title: string; blurb: string; faqs: { q: string; a: string }[] };

export const HELP: HelpTopic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    blurb: "Creating an account and finding your first course.",
    faqs: [
      { q: "Is it free to join?", a: "Yes. Creating an account is free, and some courses are free too. You only pay for the paid courses you choose to buy." },
      { q: "I didn't get the confirmation email.", a: "Check your spam or promotions folder. If it isn't there after a few minutes, try signing up again with the same email, or contact us." },
      { q: "How do I find courses?", a: "Open Courses on the website, or Browse courses in your dashboard. Filter by level, or search by topic." },
      { q: "Can I learn on my phone?", a: "Yes. Everything works in any modern mobile browser, and you can add it to your home screen like an app. Your progress syncs between devices." },
    ],
  },
  {
    id: "learning",
    title: "Courses and certificates",
    blurb: "Lessons, quizzes, progress and certificates.",
    faqs: [
      { q: "How do I continue where I stopped?", a: "Open My courses in your dashboard and choose the course. It opens on the next lesson you haven't finished." },
      { q: "How long do I have access to a course?", a: "Each course page shows its access period. Most courses are yours for good; some give access for a set number of days after you enrol." },
      { q: "How do I get a certificate?", a: "Finish every lesson and pass every quiz in a course. Your certificate appears under Profile, then Certificates, and you get an email too." },
      { q: "How can an employer check my certificate?", a: "Every certificate has an ID. Anyone can enter it on the Verify a certificate page to confirm it's genuine and see who earned it and for which course." },
      { q: "Can I leave a review?", a: "Yes, once you're 30% of the way through a course. Reviews appear after a quick check by our team." },
    ],
  },
  {
    id: "payments",
    title: "Buying and payments",
    blurb: "Paying for courses, receipts, coupons and refunds.",
    faqs: [
      { q: "How do I pay?", a: "Add a course to your cart and check out. Payments are handled by Paystack, by card, bank transfer or USSD." },
      { q: "Is it safe to pay here?", a: "Yes. Payments are handled by Paystack and your card details never touch our servers. We only give you access once Paystack confirms the payment." },
      { q: "Can I buy without an account?", a: "Yes. We create an account for you after payment and email your login details." },
      { q: "How do I use a coupon?", a: "Enter the code in the coupon field at checkout and press Apply. The discount shows before you pay." },
      { q: "Can I get a refund?", a: "Courses can be refunded within 14 days if you've completed less than 30% of them. See the Refund Policy for the details." },
    ],
  },
  {
    id: "account",
    title: "Account and security",
    blurb: "Passwords, two-step sign-in, emails and your data.",
    faqs: [
      { q: "I forgot my password.", a: "Choose Forgot password on the sign-in page and we'll email you a link to set a new one." },
      { q: "How do I turn on two-step verification?", a: "Go to Settings, then Security, and set up an authenticator app. You'll enter a code from it each time you sign in." },
      { q: "Can I make my profile public?", a: "Yes. Choose a username in Settings and switch your profile to public. It will show your certificates and badges." },
      { q: "Can I control the emails I get?", a: "Yes. Under Settings, then Notifications, you can turn course updates, support replies and news on or off. Account emails like receipts always send." },
      { q: "How do I download my data?", a: "Go to Settings, then Account, and click Export your data to download everything we hold about you as a file." },
    ],
  },
];
