export const ACTIVE = 'active';
export const ALPHA = 'alpha';
export const AUDITOR = 'auditor';
export const BONKED = 'bonked';
export const DECEASED = 'deceased';
export const DISMISSED = 'dismissed';
export const INACTIVE_EXTENSION = 'inactive extension';
export const INACTIVE = 'inactive';
export const NON_RANGER = 'non ranger';
export const PAST_PROSPECTIVE = 'past prospective';
export const PROSPECTIVE = 'prospective';
export const PROSPECTIVE_WAITLIST = 'prospective waitlist';
export const RESIGNED = 'resigned';
export const RETIRED = 'retired';
export const SUSPENDED = 'suspended';
export const UBERBONKED = 'uberbonked';

// Statuses allowed to work / check in

export const ALLOWED_TO_WORK = [
  ACTIVE,
  ALPHA,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,    // Mentor will need to convert Alpha
  RETIRED,
];
