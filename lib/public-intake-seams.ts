/**
 * Shapes for future public intake APIs — no network calls from this module.
 * Callers build payloads locally until `EXPO_PUBLIC_*` endpoints exist.
 */

export type QuotePracticeRole =
  | 'attending'
  | 'resident_fellow'
  | 'practice_owner'
  | 'employed'
  | 'other'
  | '';

export type QuoteIntakePayloadV1 = {
  schemaVersion: 1;
  /** ISO timestamp when the user completed the flow (client clock). */
  capturedAtIso: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  email: string;
  /** Optional — helps advisors prioritize clinical workflows */
  medicalSpecialtyOrRole: string;
  practiceRole: QuotePracticeRole;
  productInterest: 'disability' | 'life' | 'both' | 'unsure';
  notes: string;
};

export function buildQuoteIntakePayloadV1(input: Omit<QuoteIntakePayloadV1, 'schemaVersion' | 'capturedAtIso'>): QuoteIntakePayloadV1 {
  return {
    schemaVersion: 1,
    capturedAtIso: new Date().toISOString(),
    ...input,
  };
}

export type ContactIntakePayloadV1 = {
  schemaVersion: 1;
  capturedAtIso: string;
  name: string;
  email: string;
  phone: string;
  medicalSpecialtyOrRole: string;
  message: string;
  preferredTimes: string;
};

export function buildContactIntakePayloadV1(
  input: Omit<ContactIntakePayloadV1, 'schemaVersion' | 'capturedAtIso'>,
): ContactIntakePayloadV1 {
  return {
    schemaVersion: 1,
    capturedAtIso: new Date().toISOString(),
    ...input,
  };
}

export type DocumentIntakeDraftV1 = {
  schemaVersion: 1;
  capturedAtIso: string;
  /** Filename only — no binary in this draft object */
  selectedFileName: string | null;
  advisorNote: string;
};

export function buildDocumentIntakeDraftV1(
  input: Omit<DocumentIntakeDraftV1, 'schemaVersion' | 'capturedAtIso'>,
): DocumentIntakeDraftV1 {
  return {
    schemaVersion: 1,
    capturedAtIso: new Date().toISOString(),
    ...input,
  };
}
