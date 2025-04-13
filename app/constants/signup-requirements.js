// Personal Information has not been reviewed
import {ALPHA, ECHELON, PROSPECTIVE} from "clubhouse/constants/person_status";
import {htmlSafe} from '@ember/template';

export const PI_UNREVIEWED = 'pi-unreviewed';
// BPGUID has not been linked.
export const BPGUID_MISSING = 'bpguid-missing';
// Online course has not been completed but its not availabl yet
export const OC_DISABLED = 'oc-disabled';
// Online course has not been completed
export const OC_MISSING = 'oc-missing';
// Callsign is unapproved
export const CALLSIGN_UNAPPROVED = 'callsign-unapproved';
// Photo is missing or been rejected
export const PHOTO_UNAPPROVED = 'photo-unapproved';
// Person is a past prospective.
export const PAST_PROSPECTIVE = 'past-prospective';

export const UNSIGNED_SANDMAN_AFFIDAVIT = 'unsigned-sandman-affidavit';

export const REQUIREMENT_LABELS = {
  [PI_UNREVIEWED]: 'The Personal Information needs to be reviewed first',
  [BPGUID_MISSING]: 'The Burner Profile and Clubhouse accounts are not linked',
//  [OC_DISABLED]: 'The Online Course has to be completed. However, the course is not quite ready yet and usually available by mid-to-late March. Watch the Ranger Announce mailing list for a message on when the course will be available.',
  [OC_MISSING]: 'The Online Course has not been completed.',
  [CALLSIGN_UNAPPROVED]: 'Callsign has not been approved',
  [PHOTO_UNAPPROVED]: 'The BMID photo is missing or has been rejected',
  [PAST_PROSPECTIVE]: 'The person is a Past Prospective is not eligible to sign up for any trainings or on playa shifts.',
  [UNSIGNED_SANDMAN_AFFIDAVIT]: 'The Sandman Affidavit has to be agreed to first before the shift can be signed up for.<br> Visit Me > Agreements to sign the affidavit.'
};

export const OC_DISABLED_PREFIX = 'The Online Course has to be completed. However, the course is not quite ready yet and usually available by early April. Check back around then. ';

export function requirementInfo(status, requirements) {
  return requirements.map((r) => {
    if (r === OC_DISABLED) {
      let message = OC_DISABLED_PREFIX;

      switch (status) {
        case ALPHA:
        case PROSPECTIVE:
          message += 'Watch for a message from the Ranger Volunteer Coordinators.';
          break;

        case ECHELON:
          message += 'Email the Volunteer Coordinators if you have questions.'
          break;

        default:
          message += 'Watch the Ranger Announce mailing list for a message on when the course will be available.';
          break;
      }

      return message;
    } else {
      const label = REQUIREMENT_LABELS[r];
      return label ? htmlSafe(label) : `Bug: unknown status ${r}`;
    }
  })
}
