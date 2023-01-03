import Model, { attr } from '@ember-data/model';

export default class PersonPositionLogModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('string') joined_on;
  @attr('string') left_on;

  @attr('', { readOnly: true }) person;
  @attr('', { readOnly: true }) position;
}
