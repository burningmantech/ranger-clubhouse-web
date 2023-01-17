import Model, { attr } from '@ember-data/model';

// Handle reservation types
export const TYPE_BRC_TERM = 'brc_term';
export const TYPE_DECEASED_PERSON = 'deceased_person';
export const TYPE_DISMISSED_PERSON = 'dismissed_person';
export const TYPE_RADIO_JARGON = 'radio_jargon';
export const TYPE_RANGER_TERM = 'ranger_term';
export const TYPE_SLUR = 'slur';
export const TYPE_TWII_PERSON = 'twii_person';
export const TYPE_UNCATEGORIZED = 'uncategorized';

export const TypeLabels = {
  [TYPE_BRC_TERM]: 'BRC term',
  [TYPE_DECEASED_PERSON]: 'Deceased person',
  [TYPE_DISMISSED_PERSON]: 'Dismissed person',
  [TYPE_RADIO_JARGON]: 'Radio jargon',
  [TYPE_RANGER_TERM]: 'Ranger term',
  [TYPE_SLUR]: 'Slur',
  [TYPE_TWII_PERSON]: 'TWII Person',
  [TYPE_UNCATEGORIZED]: 'Uncategorized',
};

export default class HandleReservationModel extends Model {
  @attr('string') handle;

  @attr('string', { defaultValue: TYPE_UNCATEGORIZED }) reservation_type;

  @attr('string') start_date;

  // TODO(srabraham): this doesn't save correctly when transitioning from having
  // an end date set to attempting to not have an end date. Laravel returns a
  // complaint, saying that it's trying to set "end_date =", when really we want
  // end_date=NULL. Hopefully Frankenstein can advise on this, because I
  // struggled for a while in vain, and I'm not even sure if it should be a
  // client-side or server-side fix.
  @attr('string') end_date;

  @attr('string') reason;
}
