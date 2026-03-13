// app/(protected)/dashboard/requests/_components/mockContracts.ts
import { Contract } from "@/types/contract";

export const mockContracts: Contract[] = [
  {
    _id: "64ff1a1a9c001",
    contractId: "contract-1",
    contractTitle: "Website Development Agreement",
    companyName: "Acme Corporation",
    companyLogoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    bgImageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",

    description:
      "Agreement for designing and developing a responsive corporate website.",
    summary:
      "This contract outlines the responsibilities, payment terms, and delivery timeline for the development of Acme Corporation’s official website.",

    startDate: "2026-01-10",
    deadline: "2026-02-10",

    progress: 35,
    contractStatus: "pending",

    keypoints: [
      "Responsive web design",
      "SEO optimization",
      "Cross-browser compatibility",
      "30-day delivery timeline",
    ],

    clauses: [
      "All intellectual property belongs to Acme Corporation upon completion.",
      "Confidentiality must be maintained throughout the project.",
      "Any delay beyond 7 days may incur penalties.",
      "Termination allowed with written notice.",
    ],

    contractContent: `
# Website Development Agreement

This Website Development Agreement is entered into between **Acme Corporation** and the Contractor.

---

## 1. Scope of Work
The contractor agrees to design and develop a responsive website using modern technologies.

## 2. Deliverables
- Fully functional website
- Source code and documentation
- Deployment support

## 3. Payment Terms
A total payment of **$5,000** will be released upon successful completion.

## 4. Confidentiality
All shared materials and business data must remain confidential.

## 5. Termination
Either party may terminate this agreement with prior written notice.
    `,
    ownerSigned: false,
    partyBSigned: false,
    ownerAgreed: false,
    partyBAgreed: false,
  },

  {
    _id: "64ff1a1a9c002",
    contractId: "contract-2",
    contractTitle: "Mobile App Maintenance Contract",
    companyName: "BlueSoft Ltd",
    companyLogoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    bgImageUrl:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=80",

    description:
      "Annual maintenance and technical support for an existing mobile application.",
    summary:
      "This agreement covers ongoing maintenance, bug fixes, and performance improvements for the client’s mobile app.",

    startDate: "2026-02-01",
    deadline: "2027-01-31",

    progress: 0,
    contractStatus: "pending",

    keypoints: [
      "Monthly performance reviews",
      "Bug fixes and optimizations",
      "Security patches",
      "Priority support",
    ],

    clauses: [
      "Support available during business hours only.",
      "Major feature changes require a new agreement.",
      "Monthly reports must be submitted.",
    ],

    contractContent: `
# Mobile App Maintenance Agreement

This Maintenance Agreement is made between **BlueSoft Ltd** and the Contractor.

---

## 1. Services
The contractor shall provide ongoing maintenance and support services.

## 2. Duration
The agreement is valid for a period of **12 months** from the start date.

## 3. Payment
A monthly fee of **$1,200** will be paid at the beginning of each month.

## 4. Termination
Either party may terminate the agreement with a 30-day written notice.
    `,
    ownerSigned: false,
    partyBSigned: false,
    ownerAgreed: false,
    partyBAgreed: false,
  },
];
