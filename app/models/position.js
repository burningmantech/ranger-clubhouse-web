import Model, {attr} from '@ember-data/model';

export const TYPE_COMMAND = 'Command';
export const TYPE_FRONTLINE = 'Frontline';
export const TYPE_HQ = 'HQ';
export const TYPE_LOGISTICS = 'Logistics';
export const TYPE_MENTORING = 'Mentoring';
export const TYPE_OTHER = 'Other';
export const TYPE_TRAINING = 'Training';

export const TEAM_CATEGORY_ALL_MEMBERS = 'all_members';
export const TEAM_CATEGORY_OPTIONAL = 'optional';
export const TEAM_CATEGORY_PUBLIC = 'public';

export const TeamCategoryLabels = {
  [TEAM_CATEGORY_ALL_MEMBERS]: 'All Members',
  [TEAM_CATEGORY_OPTIONAL]: 'Optional',
  [TEAM_CATEGORY_PUBLIC]: 'Public',
}

export default class PositionModel extends Model {
  @attr('string') title;
  @attr('boolean', {defaultValue: false}) new_user_eligible;
  @attr('boolean', {defaultValue: false}) all_rangers;
  @attr('boolean', {defaultValue: false}) count_hours;

  @attr('number') team_id;
  @attr('string', {defaultValue: TEAM_CATEGORY_OPTIONAL}) team_category;

  @attr('boolean', {defaultValue: false}) require_training_for_roles;

  @attr('boolean', {defaultValue: false}) no_training_required;

  @attr('') role_ids;

  @attr('number') min;
  @attr('number') max;
  @attr('boolean') on_sl_report;
  @attr('boolean') on_trainer_report;
  @attr('string') short_title;
  @attr('string') type;
  @attr('number') training_position_id;
  @attr('number') parent_position_id;
  @attr('boolean') prevent_multiple_enrollments;
  @attr('string') contact_email;
  @attr('boolean', {defaultValue: true}) active;
  @attr('boolean', {defaultValue: false}) alert_when_becomes_empty;
  @attr('boolean', {defaultValue: false}) alert_when_no_trainers;
  @attr('boolean', {defaultValue: false}) cruise_direction;
  @attr('boolean', {defaultValue: false}) deselect_on_team_join;
  @attr('boolean', {defaultValue: false}) no_payroll_hours_adjustment;
  @attr('boolean', {defaultValue: false}) mvr_eligible;
  @attr('boolean', {defaultValue: false}) mvr_signup_eligible;
  @attr('boolean', {defaultValue: false}) pvr_eligible;
  @attr('boolean', {defaultValue: false}) awards_eligible;
  @attr('boolean', {defaultValue: false}) awards_auto_grant;
  @attr('boolean', {defaultValue: false}) awards_grants_service_year;

  @attr('string') resource_tag;

  @attr('boolean', {defaultValue: false}) auto_sign_out;
  @attr('number', {defaultValue: 0.0}) sign_out_hour_cap;

  @attr('boolean', { defaultValue: false }) not_timesheet_eligible;

  // Paycom employee paycode
  @attr('string') paycode;

  get teamCategoryLabel() {
    return TeamCategoryLabels[this.team_category] ?? this.team_category;
  }
}
