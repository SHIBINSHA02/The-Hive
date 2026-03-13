/**
 * core.ts
 * -------
 * This file contains the mandatory ("core") clauses for the General Business /
 * Service Agreement template.
 *
 * Core clauses are required in every generated contract.
 *
 * How this works:
 * - Each key in this object is a clause ID.
 * - The clause IDs must match the IDs listed in `structure.ts`.
 * - Each clause is written as a string containing placeholders like {{PARTY_A_NAME}}.
 * - During contract generation, placeholders will be replaced with actual values.
 *
 * Notes:
 * - Keep clause text professional and legally structured.
 * - Avoid hardcoding values; use placeholders instead.
 */

export const coreClauses = {
  title: `
{{AGREEMENT_TITLE}}
`,

  parties: `
This Agreement ("Agreement") is entered into by and between:

1. {{PARTY_A_NAME}}, a {{PARTY_A_TYPE}}, having its principal address at {{PARTY_A_ADDRESS}} ("Party A"),

and

2. {{PARTY_B_NAME}}, a {{PARTY_B_TYPE}}, having its principal address at {{PARTY_B_ADDRESS}} ("Party B").

Party A and Party B may individually be referred to as a "Party" and collectively as the "Parties".
`,

  effective_date: `
EFFECTIVE DATE

This Agreement shall become effective as of {{EFFECTIVE_DATE}} ("Effective Date").
`,

  background: `
BACKGROUND (RECITALS)

WHEREAS, Party A desires to engage Party B to provide certain services or deliverables; and

WHEREAS, Party B agrees to provide such services under the terms and conditions set forth in this Agreement;

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the Parties agree as follows.
`,

  definitions: `
DEFINITIONS

For the purpose of this Agreement, the following terms shall have the meanings set forth below:

1. "Services" means the work, tasks, and deliverables described in this Agreement, including but not limited to {{SERVICE_DESCRIPTION}}.

2. "Deliverables" means the output or results to be provided by Party B, including {{DELIVERABLES}}.

3. "Confidential Information" means any non-public information disclosed by one Party to the other Party, whether in written, oral, electronic, or any other form, that is marked confidential or reasonably should be understood to be confidential.

4. "Effective Date" means the date mentioned in the Effective Date section of this Agreement.
`,

  scope_of_services: `
SCOPE OF SERVICES

1. Party B agrees to provide the Services described below:

   {{SERVICE_DESCRIPTION}}

2. The expected Deliverables under this Agreement include:

   {{DELIVERABLES}}

3. Unless otherwise agreed in writing, the Services shall be performed at:

   {{SERVICE_LOCATION}}

4. Party B shall perform the Services in a professional and workmanlike manner and shall use reasonable skill, care, and diligence consistent with industry standards.
`,

  payment_terms: `
PAYMENT TERMS

1. In consideration of the Services, Party A agrees to pay Party B an amount of {{PAYMENT_AMOUNT}} {{PAYMENT_CURRENCY}}.

2. Payment Schedule:
   {{PAYMENT_SCHEDULE}}

3. Payment Method:
   {{PAYMENT_METHOD}}

4. Unless otherwise stated, invoices (if applicable) must be paid within a reasonable period from the invoice date.

5. Late Payment:
   In case of delayed payment, Party A may be liable to pay late payment interest or charges as follows:
   {{LATE_PAYMENT_INTEREST}}

6. Taxes:
   {{TAXES_DESCRIPTION}}
`,

  expenses: `
EXPENSES

1. Unless otherwise agreed in writing, Party B shall bear all costs and expenses incurred in the performance of the Services.

2. If Party A agrees to reimburse expenses, Party B must obtain prior written approval and provide supporting receipts or documentation.
`,

  term_and_termination: `
TERM AND TERMINATION

1. Term:
   This Agreement shall commence on {{START_DATE}} and shall remain in effect until {{END_DATE}}, unless terminated earlier in accordance with this section.

2. Term Description (if applicable):
   {{CONTRACT_TERM_DESCRIPTION}}

3. Termination for Convenience:
   Either Party may terminate this Agreement by providing written notice to the other Party.

4. Termination for Cause:
   Either Party may terminate this Agreement immediately upon written notice if the other Party materially breaches this Agreement and fails to cure such breach within a reasonable period after notice.

5. Effect of Termination:
   Upon termination, Party B shall cease providing the Services, and Party A shall pay Party B for Services performed up to the termination date (if applicable).
`,

  governing_law: `
GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of {{GOVERNING_LAW_STATE}}, {{GOVERNING_LAW_COUNTRY}}, without regard to its conflict of law principles.
`,

  dispute_resolution: `
DISPUTE RESOLUTION

1. In the event of any dispute, controversy, or claim arising out of or relating to this Agreement, the Parties agree to attempt to resolve the dispute amicably through good faith negotiations.

2. If the dispute is not resolved through negotiation, the dispute shall be resolved through:
   {{DISPUTE_RESOLUTION_METHOD}}

3. If arbitration is selected, the arbitration location shall be:
   {{ARBITRATION_LOCATION}}
`,

  notices: `
NOTICES

1. Any notice required or permitted under this Agreement shall be provided in writing and delivered through the following method:
   {{NOTICE_METHOD}}

2. Notice Address for Party A:
   {{NOTICE_ADDRESS_PARTY_A}}

3. Notice Address for Party B:
   {{NOTICE_ADDRESS_PARTY_B}}
`,

  entire_agreement: `
ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the Parties with respect to the subject matter hereof and supersedes all prior agreements, negotiations, representations, and understandings, whether written or oral.
`,

  signatures: `
IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

------------------------------------
PARTY A: {{PARTY_A_NAME}}

Authorized Signatory: {{PARTY_A_SIGNATORY_NAME}}
Title: {{PARTY_A_SIGNATORY_TITLE}}
Email: {{PARTY_A_EMAIL}}

Signature: {{PARTY_A_SIGNATURE}}
Date: {{EFFECTIVE_DATE}}


------------------------------------
PARTY B: {{PARTY_B_NAME}}

Authorized Signatory: {{PARTY_B_SIGNATORY_NAME}}
Title: {{PARTY_B_SIGNATORY_TITLE}}
Email: {{PARTY_B_EMAIL}}

Signature: {{PARTY_B_SIGNATURE}}
Date: {{EFFECTIVE_DATE}}
`,
} as const;

export type CoreClauseId = keyof typeof coreClauses;
