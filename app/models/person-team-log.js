import Model, { attr } from '@ember-data/model';

export default class PersonPositionLogModel extends Model {
  @attr('number') person_id;
  @attr('number') team_id;
  @attr('string') joined_on;
  @attr('string') left_on;

  @attr('', { readOnly: true }) person;
  @attr('', { readOnly: true }) team;
}
