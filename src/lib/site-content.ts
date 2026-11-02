// Fixed editorial content for the public site: people, legal-training topics, NBA-ICLE programmes and FAQs.
// Everything here comes from the old ME Academy site or from ME's briefing documents (docs/brief). Where a fact is
// not known (dates, CPD points for older recordings) the field is left out, and pages only show fields that exist.

// The two roles are always written exactly like this. Never "Founder & Lead Consultant of ME Academy".
export const MARY_ACADEMY_ROLE = "Founder & Lead Facilitator, ME Academy";
export const MARY_CONSULT_ROLE = "Founder & Lead Consultant, ME Consult";

export type Facilitator = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  areas: string[];
};

export const FACILITATORS: Facilitator[] = [
  {
    slug: "mary-ekemezie",
    name: "Mary Ekemezie",
    role: MARY_ACADEMY_ROLE,
    photo: "/content/people/mary-ekemezie.png",
    bio: "Mary Ekemezie founded ME Academy in 2021 and leads its training in corporate-commercial and transactional law. She is a corporate and investment lawyer with more than 18 years of experience.",
    areas: ["M&A", "Private equity", "Corporate restructuring", "Corporate finance", "Corporate advisory", "Employment law"],
  },
  {
    slug: "onyinye-okafor",
    name: "Onyinye Okafor",
    role: "Partner, Udo Udoma & Belo-Osagie",
    photo: "/content/people/onyinye-okafor.png",
    bio: "Onyinye Okafor practises banking and finance and corporate advisory. Her work covers LMA documents, project finance, debt restructuring, structured and trade finance and debt capital markets. She has advised on the Geometric Independent Power Plant Project and on a NGN200bn medium term facility to MTN Nigeria led by Citibank Nigeria.",
    areas: ["Banking & finance", "LMA documents", "Project finance", "Debt restructuring", "Debt capital markets"],
  },
  {
    slug: "okechukwu-okoro",
    name: "Okechukwu Okoro",
    role: "Partner and Deputy Managing Partner, G. Elias",
    photo: "/content/people/okechukwu-okoro.jpg",
    bio: "Okechukwu Okoro heads the energy practice at G. Elias and the energy practice group of Multilaw. His work includes Project Gazelle, a US$3.3bn NNPC crude forward sale financed by an Afreximbank-led syndicate. He is ranked by IFLR and Legal500 and sits on the AIEN Africa Regional Committee.",
    areas: ["Energy", "Project finance", "Forward sales", "Divestments"],
  },
  {
    slug: "joseph-eimunjeze",
    name: "Joseph Eimunjeze",
    role: "Partner, Udo Udoma & Belo-Osagie",
    photo: "/content/people/joseph-eimunjeze.png",
    bio: "Joseph Eimunjeze advises on mergers and acquisitions, insolvency and restructuring, foreign investment, banking regulatory compliance, project finance, derivatives, securities, foreign exchange and Islamic finance, as well as corporate and petroleum taxation. He is a chartered tax practitioner and an associate member of CITN.",
    areas: ["M&A", "Restructuring", "Banking regulation", "Securities", "Tax"],
  },
  {
    slug: "victor-samuel",
    name: "Victor Samuel",
    role: "Managing Associate, Udo Udoma & Belo-Osagie",
    photo: "/content/people/victor-samuel.webp",
    bio: "Victor Samuel has more than 10 years of experience in project development and banking and finance. He advised Geometric Power on a US$50m Afreximbank debt, on the restructuring of a facility above US$500m and on the Aba Integrated Power Project. He was named an IFLR1000 Rising Star from 2021 to 2023.",
    areas: ["Project development", "Banking & finance", "Power"],
  },
  {
    slug: "jerome-okoro",
    name: "Dr. Jerome Okoro",
    role: "Managing Partner, Tetralex Legal & Advisory",
    photo: "/content/people/jerome-okoro.jpg",
    bio: "Dr. Jerome Okoro holds a PhD in Energy Law from the University of Ibadan, an LLM from the University of Lagos and an LLB from UNN. He practises tax litigation, commercial litigation and energy law, and previously worked in the legal department of FIRS. He is a member of CIArb (UK), IFA and the NBA.",
    areas: ["Tax litigation", "Commercial litigation", "Energy law"],
  },
  {
    slug: "chisom-ndubuisi",
    name: "Chisom Ndubuisi",
    role: "Senior Associate, Udo Udoma & Belo-Osagie",
    photo: "/content/people/chisom-ndubuisi.jpg",
    bio: "Chisom Ndubuisi works in dispute resolution, compliance and investigations. She is a Certified Fraud Examiner and contributes to the Afriwise Commercial Crime Registry. Her practice covers commercial litigation, white-collar crime, ethics and compliance, anti-corruption, AML/CFT, tax disputes, internal investigations and asset recovery.",
    areas: ["Investigations", "Compliance", "Anti-corruption", "Dispute resolution"],
  },
];

export const facilitatorBySlug = (slug: string) => FACILITATORS.find((f) => f.slug === slug);

// Who facilitates which course, where the old site named them. Courses missing here show no facilitator block.
export const COURSE_FACILITATORS: Record<string, string[]> = {
  "negotiating-the-lma-facility-agreement-and-equity-transaction-advisory": ["onyinye-okafor", "mary-ekemezie"],
  "introduction-to-banking-and-finance-masterclass": ["onyinye-okafor", "joseph-eimunjeze"],
  "introduction-to-project-finance": ["okechukwu-okoro"],
};

// Mary Ekemezie's credentials as listed on the old site. Shown on her own page, where ME Consult is also in context.
export const MARY_CREDENTIALS = [
  "Advised on the first ETF listing on the NSE.",
  "Advised on the merger of the Nigerian subsidiaries of the world's largest brewery.",
  "Advised on the first dual LSE and NSE listing by an indigenous oil and gas company.",
  "Advised on a joint venture between an indigenous oil and gas company and the world's largest independent commodities trader.",
  "Recognised as a National Leader by Who's Who Legal for employment law.",
];

export type Faq = { q: string; a: string };

export type Topic = {
  slug: string;
  title: string;
  h1: string;
  summary: string;
  intro: string[];
  learn: string[];
  // A course is listed when its title, category, summary or skills contain one of these.
  match: string[];
  faqs: Faq[];
  sme?: string;
};

export const TOPICS: Topic[] = [
  {
    slug: "corporate-commercial-law",
    title: "Corporate & commercial law",
    h1: "Corporate and commercial law training for Nigerian lawyers",
    summary: "The core skills of corporate-commercial practice, taught by practitioners.",
    intro: [
      "Corporate-commercial practice is the legal work behind running, financing and growing a business. It covers research on laws and regulations, advisory memos and opinions, drafting and reviewing agreements, acquisitions and divestments, due diligence, investment approvals and employment matters in deals.",
      "ME Academy teaches this as practice, not theory. Courses are led by lawyers who do the work, and they are built to take a junior lawyer from knowing the law to using it on a transaction.",
    ],
    learn: [
      "Researching laws and regulations for a client question",
      "Writing legal advice, from memos and emails to formal legal opinions",
      "Drafting and reviewing agreements",
      "Asset acquisitions and divestments, including Nigerian land tenure and perfection of title",
      "Legal due diligence for transactions and projects",
      "Investment approvals, direct and indirect",
    ],
    match: ["corporate", "commercial"],
    faqs: [
      { q: "What does a corporate-commercial lawyer do?", a: "A corporate-commercial lawyer advises businesses on how they are set up, financed, governed and sold. Day to day that means researching the law, drafting and reviewing agreements, running due diligence and advising on transactions." },
      { q: "Who is this training for?", a: "Junior lawyers, mid-level associates moving into transactional work, in-house counsel and any lawyer who wants practical training in corporate-commercial work." },
    ],
    sme: "startup-documents",
  },
  {
    slug: "transactional-law",
    title: "Transactional law",
    h1: "Transactional law: how deals are structured, documented and closed",
    summary: "Practical training on the legal workstreams of a transaction.",
    intro: [
      "Transactional law is the legal side of a deal: structuring it, investigating the target, negotiating the documents and managing the path to closing.",
      "Our transactional courses follow a deal from start to finish, including due diligence, conditions precedent and subsequent, representations and warranties and disclosure letters.",
    ],
    learn: [
      "How equity and asset deals are structured",
      "Managing conditions precedent and conditions subsequent",
      "The purpose and limits of a disclosure letter",
      "Representations and warranties in equity deals",
      "Working with lenders, borrowers and counsel on financing transactions",
    ],
    match: ["transaction", "equity", "financing"],
    faqs: [
      { q: "What does a transactional lawyer do?", a: "A transactional lawyer works on deals such as acquisitions, investments and financings. They investigate the target, draft and negotiate the documents, and manage the steps needed to close." },
      { q: "How do I learn transactional law?", a: "Formal legal education covers the principles but rarely the day-to-day work. Practical courses taught by practising lawyers, followed by exposure to real deals, are the quickest route." },
    ],
  },
  {
    slug: "contract-drafting",
    title: "Contract drafting",
    h1: "Contract drafting and agreement review for young lawyers",
    summary: "Draft and review commercial agreements with confidence.",
    intro: [
      "Good drafting turns a commercial deal into clear obligations. Good review spots what is missing, one-sided or risky before a client signs.",
      "These courses focus on the agreements lawyers meet most often, including shareholders agreements, share subscription agreements and the clauses that protect a client.",
    ],
    learn: [
      "Drafting shareholders agreements and share subscription agreements",
      "Linking due diligence findings to contract protections",
      "Reviewing an agreement from each side of the table",
      "Governance, share transfers, funding and exit provisions",
    ],
    match: ["drafting", "agreement", "contract"],
    faqs: [
      { q: "How do I draft a commercial contract?", a: "Start from the commercial deal, then set out each party's obligations, the conditions to performance, the risk allocation and the exit and dispute terms. Working from a precedent and then adapting it to the deal is standard practice." },
      { q: "How do I review a commercial agreement?", a: "Read it from your client's side first. Check the parties, scope, price, risk allocation, termination and liability clauses, then look for what the agreement leaves out." },
    ],
    sme: "investment-agreements",
  },
  {
    slug: "contract-negotiation",
    title: "Contract negotiation",
    h1: "Contract negotiation: protecting your client at the table",
    summary: "Negotiate representations, warranties and facility terms.",
    intro: [
      "Negotiation is where a lawyer's drafting skill meets the client's commercial priorities. It is learned by seeing real positions argued on real clauses.",
      "Our negotiation courses cover the clauses that are most contested in lending and equity deals.",
    ],
    learn: [
      "Negotiating representations and warranties, with qualifications, disclosures and carve-outs",
      "Negotiating financial covenants, information undertakings and general undertakings",
      "Understanding market position on interest, fees, prepayment and increased costs",
      "Holding a position in favour of your client when negotiating a loan",
    ],
    match: ["negotiat"],
    faqs: [
      { q: "How do I negotiate a contract as a lawyer?", a: "Know your client's priorities and walk-away points before the first call, understand what is market on each clause, and trade the points that matter least to your client for the ones that matter most." },
    ],
  },
  {
    slug: "due-diligence",
    title: "Due diligence",
    h1: "Legal due diligence: how to investigate a company or project",
    summary: "Run and report on legal due diligence for deals and financings.",
    intro: [
      "Legal due diligence is the investigation that tells a buyer, investor or lender what they are really getting. It shapes the price, the conditions to closing and the protections in the contract.",
      "ME Academy offers due diligence training for equity deals, financings and project finance, including how to write the report.",
    ],
    learn: [
      "The purpose and management of legal due diligence",
      "Roles of lenders, borrowers and counsel in financing due diligence",
      "Reviewing corporate, contract, regulatory, property, employment and litigation records",
      "Project finance due diligence on title, regulatory approvals and permits",
      "Writing a due diligence report",
    ],
    match: ["due diligence"],
    faqs: [
      { q: "How do I conduct legal due diligence?", a: "Agree the scope, send a request list, review the documents received, raise follow-up questions and report your findings with a clear view of risk and how it should be handled in the deal documents." },
      { q: "What is due diligence for startups?", a: "It is the review an investor carries out before putting money in. Startups can prepare by keeping their corporate records, contracts, employment documents and intellectual property in order." },
    ],
    sme: "startup-documents",
  },
  {
    slug: "ma",
    title: "M&A",
    h1: "M&A and equity transaction advisory",
    summary: "The legal workstreams of a merger, acquisition or equity investment.",
    intro: [
      "Mergers, acquisitions and equity investments follow a recognisable path: structuring, due diligence, negotiation, signing, satisfying conditions and closing.",
      "Our equity transaction advisory content walks through each workstream and what the lawyer is responsible for.",
    ],
    learn: [
      "Equity deal workstreams from term sheet to completion",
      "Representations and warranties",
      "Conditions precedent and conditions subsequent",
      "Disclosure letters",
      "Employment and labour issues in M&A",
    ],
    match: ["equity", "m&a", "acquisition", "shareholders"],
    faqs: [
      { q: "What is equity transaction advisory?", a: "It is the legal advice given to a buyer, seller or investor on an equity deal, covering structure, due diligence, the transaction documents and the process to closing." },
    ],
    sme: "investment-agreements",
  },
  {
    slug: "investment-agreements",
    title: "Investment agreements",
    h1: "Investment agreements: shareholders, subscription and purchase documents",
    summary: "Understand and negotiate the documents behind an investment.",
    intro: [
      "An investment is only as clear as its paper. Share subscription agreements, share purchase agreements and shareholders agreements set out who gets what, who controls what and how each party can leave.",
      "ME Academy teaches these documents for lawyers and publishes templates for founders in the SME Hub.",
    ],
    learn: [
      "The purpose of a shareholders agreement and how it fits with the CAMA",
      "Governance, share transfers, funding and exit terms",
      "Drafting share subscription agreements",
      "Negotiating representations and warranties",
    ],
    match: ["shareholders", "subscription", "investment"],
    faqs: [
      { q: "What documents are needed before raising investment?", a: "Typically a term sheet, a share subscription agreement and a shareholders agreement, supported by up-to-date corporate records and the company's key contracts. A lawyer should confirm what your deal requires." },
    ],
    sme: "investment-agreements",
  },
  {
    slug: "banking-finance",
    title: "Banking & finance",
    h1: "Banking and finance law training",
    summary: "Loans, security and the LMA facility agreement.",
    intro: [
      "Banking and finance lawyers document and secure lending. The work starts with understanding the loan, the parties and the security, and moves on to negotiating the facility agreement.",
      "Our banking and finance courses are taught by lawyers who act on major facilities and financings in Nigeria.",
    ],
    learn: [
      "The meaning and parties of loans, and secured versus unsecured lending",
      "Types of security and how security is perfected",
      "Loan documentation and fundamental clauses",
      "The LMA facility agreement and market position on key terms",
      "Conditions precedent to closing and disbursement",
    ],
    match: ["banking", "lma", "facility", "loan"],
    faqs: [
      { q: "What will I learn on the banking and finance course?", a: "You will learn how loans are structured and documented, the types of security, how to review a facility agreement from the lender's and the borrower's side, and how security is perfected." },
    ],
  },
  {
    slug: "project-finance",
    title: "Project finance",
    h1: "Project finance law training",
    summary: "Structure, document and finance infrastructure and energy projects.",
    intro: [
      "Project finance funds a project from its own future cash flows rather than from the sponsor's balance sheet. That changes how risk is allocated and how the documents are written.",
      "ME Academy's project finance content is taught by lawyers who work on energy and power financings.",
    ],
    learn: [
      "What project finance is and how it differs from other finance",
      "Term sheets, due diligence and structuring",
      "Finance, security and project documents",
      "Risk allocation, conditions precedent, representations, warranties and covenants",
      "The security package, foreign exchange, tax and regulatory approvals",
    ],
    match: ["project finance"],
    faqs: [
      { q: "What is project finance?", a: "It is a way of financing a project where lenders look mainly to the project's own cash flows and assets for repayment, usually through a special purpose company." },
    ],
  },
  {
    slug: "corporate-governance",
    title: "Corporate governance",
    h1: "Corporate governance for companies, boards and startups",
    summary: "Directors' duties, resolutions and the records every company must keep.",
    intro: [
      "Corporate governance is how a company is directed and held to account. For a small company it comes down to doing the basics well: proper resolutions, accurate records and clear director responsibilities.",
      "The SME Hub carries governance templates, including written resolutions and forms, and our courses cover governance in the context of transactions.",
    ],
    learn: [
      "Directors' duties, powers and liabilities",
      "Passing and recording resolutions",
      "Governance terms in a shareholders agreement",
      "Compliance records a company should maintain",
    ],
    match: ["governance", "resolution", "director"],
    faqs: [
      { q: "What corporate governance documents does a startup need?", a: "At minimum, the company's constitutional documents, a register of members and directors, board and shareholder resolutions for key decisions and a shareholders agreement once there is more than one owner." },
    ],
    sme: "corporate-governance",
  },
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);

// SME Hub sub-sections. Each filters the same product table.
export type SmeSection = {
  slug: string;
  title: string;
  h1: string;
  intro: string;
  match: (p: { slug: string; category: string }) => boolean;
  faqs: Faq[];
};

export const SME_SECTIONS: SmeSection[] = [
  {
    slug: "startup-documents",
    title: "Startup documents",
    h1: "Legal documents for Nigerian startups",
    intro: "The agreements and letters most young companies need early on, including NDAs, MOUs, consultancy, software development, volunteer and IP assignment agreements.",
    match: (p) => p.category === "Startup Documents" || p.slug === "startup-pack-bundle" || p.slug === "founders-agreement",
    faqs: [
      { q: "What documents does a Nigerian startup need?", a: "Most startups need founder, employment and contractor agreements, an NDA, an IP assignment and a set of corporate records. The Startup Pack in the SME Hub groups the common ones." },
      { q: "Are these templates legal advice?", a: "No. The SME Hub is not a law firm and does not give legal advice. For advice on your own situation, speak to a lawyer." },
    ],
  },
  {
    slug: "investment-agreements",
    title: "Investment agreements",
    h1: "Investment agreement templates for Nigerian businesses",
    intro: "Share subscription, share purchase, shareholders, founders and partnership agreements for companies taking on or making investment.",
    match: (p) => p.category === "Investment Agreements" || p.slug === "investment-agreements-bundle",
    faqs: [
      { q: "Which investment agreement do I need?", a: "A share subscription agreement is used when new shares are issued to an investor. A share purchase agreement transfers existing shares. A shareholders agreement governs the relationship between owners." },
    ],
  },
  {
    slug: "employment-contracts",
    title: "Employment contracts",
    h1: "Employment contract templates for Nigerian businesses",
    intro: "Employment contract templates, bundled with the HR policies that sit around them.",
    match: (p) => p.slug === "employment-contract" || p.slug === "employment-contract-and-hr-policies-bundle",
    faqs: [
      { q: "Can I use a template employment contract as it is?", a: "Templates are designed to be customised. Check each clause against the role, the employee's terms and current law before you sign." },
    ],
  },
  {
    slug: "hr-policies",
    title: "HR policies",
    h1: "HR policy templates for Nigerian SMEs",
    intro: "Code of conduct, employee handbook, disciplinary, grievance, leave, harassment, BYOD and other workplace policies.",
    match: (p) => (p.category === "Employment & HR" && p.slug !== "employment-contract") || p.slug === "employment-contract-and-hr-policies-bundle",
    faqs: [
      { q: "What HR policies do Nigerian SMEs need?", a: "A code of conduct, an employee handbook and policies on discipline, grievances, leave and harassment cover most small employers. Add others as the business grows." },
    ],
  },
  {
    slug: "corporate-governance",
    title: "Corporate governance",
    h1: "Corporate governance templates: resolutions, forms and notices",
    intro: "Written resolutions, director and company secretary appointments, share transfer forms and powers of attorney.",
    match: (p) => p.category === "Resolutions" || p.category === "Forms" || p.slug === "written-resolutions-bundle" || p.slug === "waivers-and-forms-bundle" || p.slug === "resolutions-bundle-passed-at-general-meetings",
    faqs: [
      { q: "What is a written resolution?", a: "A written resolution records a decision of the directors or members without holding a meeting. It is used for routine matters such as appointing an auditor or approving a loan." },
    ],
  },
];

export const smeSectionBySlug = (slug: string) => SME_SECTIONS.find((s) => s.slug === slug);

export type Programme = {
  slug: string;
  title: string;
  kind: "live" | "recording";
  // The matching course on this site, for price, duration and registration.
  courseSlug?: string;
  summary: string;
  objectives?: string[];
  skills?: string[];
  facilitators?: string[];
  cpd?: string;
  format: string;
};

const APPROVED = "NBA-ICLE approved";

export const NBA_AUDIENCE = ["Junior lawyers", "Mid-level associates moving into transactional work", "In-house counsel", "Lawyers who want practical training"];

export const PROGRAMMES: Programme[] = [
  {
    slug: "the-investment-agreement-series",
    title: "The Investment Agreement Series",
    kind: "live",
    summary: "A live, case-based series on the agreements behind an investment, with real-time Q&A with the facilitator.",
    cpd: "1 CPD point",
    format: "Live cohort with real-time Q&A",
  },
  {
    slug: "ma-transaction-structuring-and-legal-opinions",
    title: "M&A Transaction Structuring and Legal Opinions",
    kind: "live",
    summary: "A live programme on how M&A transactions are structured and how legal opinions are prepared.",
    cpd: "1 CPD point",
    format: "Live cohort with real-time Q&A",
  },
  {
    slug: "contract-drafting-and-due-diligence-review-for-young-lawyers",
    title: "Contract Drafting and Due Diligence Review for Young Lawyers",
    kind: "recording",
    courseSlug: "contract-drafting-and-due-diligence-review-for-young-lawyers",
    summary: "Drafting shareholders agreements and share subscription agreements, and linking due diligence findings to contract protections.",
    objectives: ["Draft a shareholders agreement and a share subscription agreement", "Link due diligence findings to protections in the contract"],
    skills: ["Contract drafting", "Due diligence review"],
    cpd: "1 CPD point",
    format: "Self-paced video and slides",
  },
  {
    slug: "due-diligence-for-financing-transactions",
    title: "Due Diligence for Financing Transactions",
    kind: "recording",
    courseSlug: "due-diligence-for-financing-transactions",
    summary: "The purpose and conduct of due diligence on a financing, the roles of lenders, borrowers and counsel, and how to write the report.",
    objectives: ["Explain the purpose and conduct of financing due diligence", "Describe the roles of lenders, borrowers and counsel", "Write a due diligence report"],
    skills: ["Due diligence", "Legal reporting"],
    cpd: "1 CPD point",
    format: "Self-paced video and slides",
  },
  {
    slug: "equity-transaction-advisory",
    title: "Equity Transaction Advisory",
    kind: "recording",
    courseSlug: "equity-transaction-advisory",
    summary: "Equity deal workstreams, representations and warranties, conditions precedent and subsequent, and disclosure letters.",
    objectives: ["Map the workstreams of an equity deal", "Handle representations and warranties", "Manage conditions precedent and subsequent", "Understand disclosure letters"],
    skills: ["Equity transactions", "Deal management"],
    cpd: "1 CPD point",
    format: "Self-paced video and slides",
  },
  {
    slug: "understanding-the-purpose-of-drafting-and-negotiating-a-formal-legal-opinion",
    title: "Understanding the Purpose of Drafting and Negotiating a Formal Legal Opinion",
    kind: "recording",
    courseSlug: "understanding-the-purpose-of-drafting-and-negotiating-a-formal-legal-opinion",
    summary: "The structure, assumptions, qualifications and liability of formal legal opinions.",
    objectives: ["Explain the structure of a formal legal opinion", "Identify assumptions and qualifications", "Understand where liability arises"],
    skills: ["Legal opinions", "Negotiation"],
    cpd: "1 CPD point",
    format: "Self-paced video and slides",
  },
  {
    slug: "due-diligence-for-project-finance-transactions",
    title: "Due Diligence for Project Finance Transactions",
    kind: "recording",
    courseSlug: "due-diligence-for-project-finance-transactions-nba-icle-recording",
    summary: "Project finance structures, their non-recourse nature, greenfield versus brownfield projects, and title, regulatory and permitting review.",
    objectives: ["Describe project finance structures and non-recourse lending", "Distinguish greenfield from brownfield projects", "Review title, regulatory approvals and permits"],
    skills: ["Project finance", "Due diligence"],
    format: "Self-paced video and slides",
  },
  {
    slug: "introduction-to-corporate-investigations-part-1",
    title: "Introduction to Corporate Investigations, Part 1",
    kind: "recording",
    courseSlug: "introduction-to-corporate-investigations-part-1",
    summary: "The first part of an introduction to corporate investigations.",
    format: "Self-paced video and slides",
  },
  {
    slug: "introduction-to-corporate-investigations-part-2",
    title: "Introduction to Corporate Investigations, Part 2",
    kind: "recording",
    courseSlug: "introduction-to-corporate-investigations-part-2",
    summary: "The second part of an introduction to corporate investigations.",
    format: "Self-paced video and slides",
  },
];

export const programmeBySlug = (slug: string) => PROGRAMMES.find((p) => p.slug === slug);
export const APPROVAL_STATUS = APPROVED;

export const NBA_FAQS: Faq[] = [
  { q: "What is NBA-ICLE?", a: "NBA-ICLE is the Nigerian Bar Association's Institute of Continuing Legal Education. It approves training providers and programmes for lawyers' continuing legal education." },
  { q: "Is ME Academy approved by NBA-ICLE?", a: "Yes. NBA-ICLE has approved ME Academy as an accredited service provider." },
  { q: "How many CPD points do ME Academy programmes carry?", a: "Each approved programme announced so far carries 1 CPD point. The CPD points for each programme are shown on its page." },
  { q: "What is the difference between live programmes and recordings?", a: "Live programmes run as cohorts with real-time Q&A. Recordings are past approved courses that you can watch at your own pace, with video and slides." },
  { q: "Who should attend?", a: "Junior lawyers, mid-level associates moving into transactional work, in-house counsel and lawyers who want practical training." },
];

export const SITE_FAQS: { group: string; items: Faq[] }[] = [
  {
    group: "About ME Academy",
    items: [
      { q: "What is ME Academy?", a: "ME Academy is a training academy that bridges the gap between formal legal education and corporate-commercial practice. Experienced legal practitioners teach practical, transactional skills through courses and NBA-ICLE approved programmes." },
      { q: "Who founded ME Academy?", a: "ME Academy was founded in 2021 by Mary Ekemezie, Founder & Lead Facilitator, ME Academy." },
      { q: "Is ME Academy the same as ME Consult?", a: "No. ME Academy is an independent training platform. ME Consult is a separate legal advisory practice. Mary Ekemezie is Founder & Lead Facilitator of ME Academy and, separately, Founder & Lead Consultant of ME Consult." },
      { q: "Who is ME Academy for?", a: "Junior lawyers, mid-level associates moving into transactional work, in-house counsel and any lawyer who wants practical training. The SME Hub is for founders and small businesses." },
    ],
  },
  {
    group: "Courses and CPD",
    items: [
      { q: "How do the courses work?", a: "Courses are recorded video lessons with slides that you can follow at your own pace on a phone or a laptop. Live programmes run as cohorts with real-time Q&A." },
      { q: "Do courses attract CPD points?", a: "NBA-ICLE approved programmes attract CPD points. See the NBA-ICLE page for the approved programmes and the points each carries." },
      { q: "Will I get a certificate?", a: "Yes. Finish a course to receive a certificate with an ID that anyone can verify on the site." },
      { q: "Are the courses suitable for junior lawyers?", a: "Yes. Courses are labelled by level, and several are written for lawyers early in their careers." },
      { q: "Can I get a refund?", a: "Refund eligibility is set out in the refund policy. Please read it before you buy." },
    ],
  },
  {
    group: "SME Hub",
    items: [
      { q: "What is the SME Hub?", a: "The SME Hub is a digital resource of legal templates for startups and small businesses in Nigeria, including investment agreements, employment contracts, HR policies, startup documents and company resolutions." },
      { q: "Are the templates customisable?", a: "Yes. They are meant to be adapted to your business, and you do not need legal training to use them." },
      { q: "Is the SME Hub a law firm?", a: "No. The SME Hub is not a law firm and does not give legal advice. For advice on your own situation, speak to a lawyer." },
      { q: "How do I buy a template?", a: "Templates are currently sold by enquiry. Send us a message from the contact page and we will help you." },
    ],
  },
  {
    group: "Help",
    items: [
      { q: "How do I contact ME Academy?", a: "Use the contact page. For account, payment and certificate questions the help centre has quick answers." },
    ],
  },
];

// Questions shown on every course page, answered from that course's own details.
export function courseFaqs(c: {
  title: string;
  summary: string | null;
  level: string;
  skills: string[];
  category: string | null;
  facilitators: string[];
  nba: Programme | null;
}): Faq[] {
  const about = c.summary || `${c.title} is a practical ${c.category ? c.category.toLowerCase() : "legal"} course from ME Academy.`;
  const junior = c.level === "beginner" ? "Yes. This course is pitched at beginners, so it suits junior lawyers." : c.level === "intermediate" ? "It suits lawyers with some practical exposure. Motivated junior lawyers can take it, but it assumes familiarity with the basics." : "It is aimed at lawyers who already work in this area.";
  return [
    { q: "What is this course about?", a: about },
    { q: "Who should take it?", a: "Junior lawyers, mid-level associates moving into transactional work, in-house counsel and lawyers who want practical training in this area." },
    { q: "Does it attract CPD points?", a: c.nba?.cpd ? `Yes. It is an NBA-ICLE approved programme and carries ${c.nba.cpd}.` : "CPD points apply to NBA-ICLE approved programmes. This course is not listed as one yet. See the NBA-ICLE page for the approved programmes." },
    { q: "Is the programme NBA-ICLE approved?", a: c.nba ? "Yes. NBA-ICLE has approved ME Academy as an accredited service provider, and this programme is listed on the NBA-ICLE page." : "NBA-ICLE has approved ME Academy as an accredited service provider. This course is not currently listed among the approved programmes." },
    { q: "Is it suitable for junior lawyers?", a: junior },
    { q: "Will participants receive course materials?", a: "Lessons are recorded video with slides. Any downloadable resources are listed on the course page." },
    { q: "Is there a recording?", a: "Yes. Courses are delivered as recorded lessons that you can watch at your own pace." },
    { q: "Who facilitates the programme?", a: c.facilitators.length ? `${joinNames(c.facilitators)}.` : "The course is taught by ME Academy's panel of practising lawyers. See the facilitators page for the full list." },
    { q: "What practical skills will I gain?", a: c.skills.length ? `${c.skills.join(", ")}.` : about },
  ];
}

function joinNames(names: string[]) {
  if (names.length < 2) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
