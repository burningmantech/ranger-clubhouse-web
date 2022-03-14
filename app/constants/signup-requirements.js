// Personal Information has not been reviewed
export const PI_UNREVIEWED = 'pi-unreviewed';
// BPGUID has not been linked.
export const BPGUID_MISSING = 'bpguid-missing';
// Online course has not been completed but its not availabl yet
export const OT_DISABLED = 'ot-disabled';
// Online course has not been completed
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
  [OT_DISABLED]: 'The Online Training Course has to be completed. However, the course is not quite ready yet and usually available by mid-to-late March. Watch the Ranger Announce mailing list for a message on when the course will be available.',
  [OT_MISSING]: 'The Online Training Course has not been completed.',
  [CALLSIGN_UNAPPROVED]: 'Callsign has not been approved',
  [PHOTO_UNAPPROVED]: 'The BMID photo is missing or has been rejected',
  [PAST_PROSPECTIVE]: 'The person is a Past Prospective is not eligible to sign up for any trainings or on playa shifts.',
};
