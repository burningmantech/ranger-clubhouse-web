import Model, {attr} from '@ember-data/model';

export default class PersonFkaModel extends Model {
  @attr('number') person_id;
  @attr('string') fka;
  @attr('string', { readOnly: true }) fka_normalized;
  @attr('string', { readOnly: true }) fka_soundex;
  @attr('date', {readOnly: true}) created_at;
}
