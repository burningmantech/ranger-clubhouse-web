import Model, { attr } from '@ember-data/model';

export default class PositionModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
  @attr('boolean') all_rangers;
  @attr('boolean') count_hours;
  @attr('number') min;
  @attr('number') max;
  @attr('boolean') auto_signout;
  @attr('boolean') on_sl_report;
  @attr('string') short_title;
  @attr('string') type;
  @attr('number') training_position_id;
  @attr('boolean') prevent_multiple_enrollments;
  @attr('string') contact_email;
}
