// Single source of truth for the registration bot check. The question text and
// its expected answer live together here so the template label and the
// controller's validation can never drift apart. This is a UX deterrent only —
// the API must independently re-validate the `human` field on POST.
const HUMAN_A = 33;
const HUMAN_B = 2;

export const HUMAN_QUESTION = `What is ${HUMAN_A} + ${HUMAN_B}?`;
export const HUMAN_ANSWER = HUMAN_A + HUMAN_B;

// Digits-only, then an exact integer compare: non-numeric junk and decorated
// forms like '35.0' or '+35' are rejected. (Leading-zero forms such as '035'
// still parse to 35 and are accepted, matching the original behavior.)
export function isHumanAnswerValid(raw) {
  const answer = (raw ?? '').trim();
  return /^\d+$/.test(answer) && parseInt(answer, 10) === HUMAN_ANSWER;
}
