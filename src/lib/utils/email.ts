/**
 * Deliberately lenient email check.
 *
 * The platform does not verify that a mailbox exists and does not send a
 * confirmation round-trip. It only asks that the input looks like an address
 * (`something@something.tld`) so profiles and recovery requests stay readable.
 */
export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim());
}

export const EMAIL_FORMAT_HINT =
  'Use the format name@example.com — deliverability is not checked.';
