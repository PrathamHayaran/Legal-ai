export const featureCards = [
  {
    title: "AI Drafting",
    description: "Generate NDAs, employment terms, and vendor agreements from plain English prompts.",
    icon: "Sparkles",
  },
  {
    title: "Risk Detection",
    description: "Surface unlimited liability, termination, and IP issues before they become disputes.",
    icon: "ShieldAlert",
  },
  {
    title: "Clause Explanation",
    description: "Turn dense legal language into interpretable guidance with business context.",
    icon: "BookOpen",
  },
  {
    title: "Verified Lawyers",
    description: "Connect with identity-verified attorneys for review, approval, and guidance.",
    icon: "Scale",
  },
  {
    title: "AI Redlining",
    description: "Suggest safer clauses and compare versions before final review.",
    icon: "GitCompare",
  },
  {
    title: "Secure Cloud Storage",
    description: "Encrypt docs in transit and at rest with enterprise-grade access controls.",
    icon: "Lock",
  },
];

export const workflowSteps = [
  {
    title: "Upload or describe",
    description: "Drop in a contract or ask LegalOS to generate one from a natural-language prompt.",
  },
  {
    title: "AI analyzes",
    description: "The platform extracts clauses, scores risk, and creates a plain-English summary.",
  },
  {
    title: "Review with context",
    description: "Explore the heatmap, ask questions, and compare proposed safer language.",
  },
  {
    title: "Get lawyer oversight",
    description: "Escalate to verified counsel for professional review and approval.",
  },
  {
    title: "Export and track",
    description: "Download DOCX/PDF versions and keep the full version history within the workspace.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Ideal for founders and solo operators.",
    features: ["3 AI document analyses", "Shared workspace", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$99",
    description: "For scaling teams that need legal automation and lawyer access.",
    features: ["Unlimited AI drafting", "Risk heatmaps", "Lawyer marketplace access"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "SAML, audit logs, and white-glove onboarding for large organizations.",
    features: ["SSO + SCIM", "Advanced permissions", "Dedicated success lead"],
    highlighted: false,
  },
];

export const testimonials = [
  {
    quote: "LegalOS cut our contract review time by 70% while keeping our outside counsel in the loop.",
    author: "Mina Chen",
    role: "VP Legal, Northstar AI",
  },
  {
    quote: "The platform feels like an Apple product for law—elegant, safe, and incredibly fast.",
    author: "Daniel Brooks",
    role: "Founder, Harbor Labs",
  },
];

export const faqs = [
  {
    question: "Can LegalOS replace a lawyer completely?",
    answer: "It handles the repetitive work and first-pass review, but the platform is designed to route high-stakes matters to qualified lawyers.",
  },
  {
    question: "What file types are supported?",
    answer: "PDF, DOCX, TXT, and scanned documents with OCR are supported for contract review.",
  },
  {
    question: "Is the platform SOC2 ready?",
    answer: "Yes. The architecture is designed for auditability, encryption, RBAC, and secure collaboration.",
  },
];
