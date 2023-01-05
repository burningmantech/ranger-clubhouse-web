import Model, {attr} from '@ember-data/model';

export default class PersonAwardModel extends Model {
  @attr('number') person_id;
  @attr('number') award_id;
  @attr('string') notes;
  @attr('date', {readOnly: true}) created_at;
  @attr('date', {readOnly: true}) updated_at;

  @attr('', { readOnly: true}) award;
}
