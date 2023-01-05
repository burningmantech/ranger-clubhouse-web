import Model, { attr } from '@ember-data/model';

export const TYPE_COMMAND = 'Command';
export const TYPE_FRONTLINE = 'Frontline';
export const TYPE_HQ = 'HQ';
export const TYPE_LOGISTICS = 'Logistics';
export const TYPE_MENTORING = 'Mentoring';
export const TYPE_OTHER = 'Other';
export const TYPE_TRAINING = 'Training';

export default class PositionModel extends Model {
  @attr('string') title;
  @attr('boolean', { defaultValue: false }) new_user_eligible;
  @attr('boolean', { defaultValue: false }) all_rangers;
  @attr('boolean', { defaultValue: false }) count_hours;

  @attr('boolean', { defaultValue: false }) is_team;
  @attr('number') team_id;
  @attr('boolean', { defaultValue: false }) all_team_members;
  @attr('boolean', { defaultValue: false }) public_team_position;

  @attr('') role_ids;

  @attr('number') min;
  @attr('number') max;
  @attr('boolean') on_sl_report;
  @attr('boolean') on_trainer_report;
  @attr('string') short_title;
  @attr('string') type;
  @attr('number') training_position_id;
  @attr('boolean') prevent_multiple_enrollments;
  @attr('string') contact_email;
  @attr('boolean', { defaultValue: true}) active;
  @attr('boolean', { defaultValue:false}) alert_when_empty;
}
