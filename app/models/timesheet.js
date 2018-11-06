import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

export default class TimesheetModel extends DS.Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('string', { readOnly: true }) position_title;
  @attr('string') on_duty;
  @attr('string') off_duty;
  @attr('number', { readOnly: true }) duration;
  @attr('number', { readOnly: true }) credits;
}
