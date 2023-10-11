import Model, {attr} from '@ember-data/model';
import optionsToLabels from "clubhouse/utils/options-to-labels";

// Handle reservation types
export const TYPE_BRC_TERM = 'brc_term';
export const TYPE_DECEASED_PERSON = 'deceased_person';
export const TYPE_DISMISSED_PERSON = 'dismissed_person';
export const TYPE_RADIO_JARGON = 'radio_jargon';
export const TYPE_RANGER_TERM = 'ranger_term';
export const TYPE_SLUR = 'slur';
export const TYPE_TWII_PERSON = 'twii_person';
export const TYPE_UNCATEGORIZED = 'uncategorized';
export const TYPE_OBSCENE = 'obscene';
export const TYPE_PHONETIC_ALPHABET = 'phonetic-alphabet';

export const ReservationTypeOptions = [
  [ 'BRC Term', TYPE_BRC_TERM ],
  [ 'Deceased Person', TYPE_DECEASED_PERSON ],
  [ 'Dismissed Person', TYPE_DISMISSED_PERSON ],
  [ 'Obscene Word', TYPE_OBSCENE ],
  [ 'Phonetic Alphabet', TYPE_PHONETIC_ALPHABET ],
  [ 'Radio Jargon', TYPE_RADIO_JARGON ],
  [ 'Ranger Term', TYPE_RANGER_TERM ],
  [ 'Slur', TYPE_SLUR ],
  [ 'TWII Person', TYPE_TWII_PERSON ],
  [ 'Uncategorized', TYPE_UNCATEGORIZED ],
];

export const ReservationTypeLabels = optionsToLabels(ReservationTypeOptions);


export default class HandleReservationModel extends Model {
  @attr('string') handle;

  @attr('string', {defaultValue: TYPE_UNCATEGORIZED}) reservation_type;

  @attr('string') start_date;

  @attr('string') expires_on;

  @attr('string') reason;

  @attr('number') twii_year;

  @attr('boolean', {readOnly: true}) has_expired;

  get reservationTypeLabel() {
    return ReservationTypeLabels[this.reservation_type] ?? this.reservation_type;
  }
}
