export const ACTIVE = 'active';
export const ALPHA = 'alpha';
export const AUDITOR = 'auditor';
export const BONKED = 'bonked';
export const DECEASED = 'deceased';
export const DISMISSED = 'dismissed';
export const INACTIVE_EXTENSION = 'inactive extension';
export const INACTIVE = 'inactive';
export const ECHELON = 'echelon';
export const PAST_PROSPECTIVE = 'past prospective';
export const PROSPECTIVE = 'prospective';
export const PROSPECTIVE_WAITLIST = 'prospective waitlist';
export const RESIGNED = 'resigned';
export const RETIRED = 'retired';
export const SUSPENDED = 'suspended';
export const UBERBONKED = 'uberbonked';

// Pseudo status used for finding cheetahs via the search bar
export const CHEETAH_CUB = 'cheetahcub';

// Statuses allowed to work / check in
export const ALLOWED_TO_WORK = [
  ACTIVE,
  ALPHA,
  INACTIVE,
  INACTIVE_EXTENSION,
  ECHELON,
  PROSPECTIVE,    // Mentor will need to convert Alpha
  RETIRED,
];

export const ALLOW_TO_MESSAGE = [
  ACTIVE,
  INACTIVE,
  INACTIVE_EXTENSION,
];

// Admins or VCs may have to update legacy defunct accounts with little PII.
// Allow address validation to be bypassed for such accounts.
export const ADDRESS_VALIDATION_NOT_REQUIRED = [
  DECEASED,
  DISMISSED,
  RESIGNED,
  RETIRED
];

export const STATUS_OPTIONS = [
  ACTIVE,
  ALPHA,
  AUDITOR,
  BONKED,
  DECEASED,
  DISMISSED,
  INACTIVE_EXTENSION,
  INACTIVE,
  ECHELON,
  PAST_PROSPECTIVE,
  PROSPECTIVE,
  RESIGNED,
  RETIRED,
  SUSPENDED,
  UBERBONKED,
];

