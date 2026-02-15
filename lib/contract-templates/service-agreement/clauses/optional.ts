/**
 * optional.ts
 * -----------
 * This file contains optional clauses for the General Business / Service Agreement.
 *
 * Optional clauses are not always included in the final generated contract.
 * The generator should include them only if the user selects them (or if rules
 * later enforce them).
 *
 * How it works:
 * - Keys in this object are clause IDs.
 * - Clause IDs must match those referenced in `structure.ts`.
 * - Clause text may contain placeholders defined in `placeholders.ts`.
 *
 * Notes:
 * - These clauses strengthen the agreement legally.
 * - In MVP, inclusion is manual/checkbox-based.
 */

export const optionalClauses = {
  confidentiality: `
CONFIDENTIALITY

1. Each Party agrees that during the term of this Agreement and for a period of {{CONFIDENTIALITY_TERM}} thereafter, it shall not disclose, share, or make available any Confidential Information of the other Party to any third party without prior written consent.

2. The Receiving Party shall use the Confidential Information solely for the purpose of fulfilling its obligations under this Agreement.

3. Confidential Information shall not include information that:
   (a) is publicly available through no fault of the Receiving Party,
   (b) was lawfully known to the Receiving Party prior to disclosure,
   (c) is independently developed without reference to the Confidential Information, or
   (d) is disclosed under legal obligation, provided the disclosing Party is notified in advance (where permitted).

4. Upon termination of this Agreement, the Receiving Party shall return or destroy all Confidential Information upon request.
`,

  intellectual_property: `
INTELLECTUAL PROPERTY

1. Ownership Model:
   The intellectual property ownership model agreed by the Parties shall be:
   {{IP_OWNERSHIP_MODEL}}

2. Unless otherwise agreed in writing:
   (a) any work product, deliverables, documentation, designs, code, reports, or other materials created under this Agreement ("Work Product") shall be owned in accordance with the ownership model stated above.

3. Party B agrees that it shall not knowingly infringe upon any third-party intellectual property rights while performing the Services.
`,

  limitation_of_liability: `
LIMITATION OF LIABILITY

1. To the maximum extent permitted by applicable law, neither Party shall be liable to the other Party for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, business interruption, or loss of data, arising out of or related to this Agreement.

2. The total liability of either Party for any claims arising under this Agreement shall not exceed:
   {{LIABILITY_CAP}}

3. This limitation shall not apply to:
   (a) fraud or willful misconduct,
   (b) breach of confidentiality obligations,
   (c) infringement of intellectual property rights (if applicable),
   (d) amounts due under payment obligations.
`,

  indemnification: `
INDEMNIFICATION

1. Each Party agrees to indemnify, defend, and hold harmless the other Party, its directors, employees, and agents from and against any claims, damages, liabilities, losses, and expenses (including reasonable legal fees) arising out of:
   (a) breach of this Agreement,
   (b) negligence or misconduct of the indemnifying Party,
   (c) violation of applicable laws or regulations.

2. The indemnified Party shall promptly notify the indemnifying Party of any claim and cooperate reasonably in the defense of such claim.
`,

  force_majeure: `
FORCE MAJEURE

1. Neither Party shall be liable for any failure or delay in performance under this Agreement due to events beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, civil unrest, government actions, strikes, pandemics, or failures of internet/service providers.

2. The affected Party shall notify the other Party promptly and take reasonable steps to resume performance.

3. If the force majeure event continues for an extended period, either Party may terminate this Agreement by written notice.
`,

  assignment: `
ASSIGNMENT

Neither Party may assign or transfer its rights or obligations under this Agreement without the prior written consent of the other Party, except in the case of merger, acquisition, or sale of substantially all assets, provided the successor entity agrees to be bound by this Agreement.
`,

  severability: `
SEVERABILITY

If any provision of this Agreement is found to be invalid, illegal, or unenforceable, the remaining provisions shall remain in full force and effect.
`,

  amendments: `
AMENDMENTS

This Agreement may be amended, modified, or supplemented only by a written document signed by both Parties.
`,

  non_solicitation: `
NON-SOLICITATION

During the term of this Agreement and for a reasonable period thereafter, neither Party shall solicit or attempt to solicit the employees, contractors, or clients of the other Party for business purposes, unless expressly permitted in writing.
`,

  data_protection: `
DATA PROTECTION

1. If either Party processes personal data while performing obligations under this Agreement, such Party agrees to comply with applicable data protection laws and regulations.

2. Party B agrees to take reasonable technical and organizational measures to protect any personal data or sensitive information received during the course of the Services.

3. If required, the Parties may execute a separate Data Processing Agreement (DPA).
`,
} as const;

export type OptionalClauseId = keyof typeof optionalClauses;
