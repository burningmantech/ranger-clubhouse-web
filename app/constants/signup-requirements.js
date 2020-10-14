// Personal Information has not been reviewed
export const PI_UNREVIEWED = 'pi-unreviewed';
// BPGUID has not been linked.
export const BPGUID_MISSING = 'bpguid-missing';
// Online Training has not been completed
export const OT_MISSING = 'ot-missing';
// Callsign is unapproved
export const CALLSIGN_UNAPPROVED = 'callsign-unapproved';
// Photo is missing or been rejected
export const PHOTO_UNAPPROVED = 'photo-unapproved';
// Person is a past prospective.
export const PAST_PROSPECTIVE = 'past-prospective';

export const REQUIREMENT_LABELS = {
  [PI_UNREVIEWED]: 'The Personal Information needs to be reviewed first',
  [BPGUID_MISSING]: 'The Burner Profile and Clubhouse accounts are not linked',
  [OT_MISSING]: 'Online Training has not been completed',
  [CALLSIGN_UNAPPROVED]: 'Callsign has not been approved',
  [PHOTO_UNAPPROVED]: 'The BMID photo is missing or has been rejected',
  [PAST_PROSPECTIVE]: 'The person is a Past Prospective',
};
