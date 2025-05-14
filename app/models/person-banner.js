import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr('number') person_id;
  @attr('') person;

  @attr('boolean', { defaultValue: false }) is_permanent;
  @attr('string') message;

  @attr('number') creator_person_id;
  @attr('date', { readOnly: true }) created_at;
  @attr('') creator_person;

  @attr('number') updater_person_id;
  @attr('date', { readOnly: true }) updated_at;
  @attr('') updater_person;
}
