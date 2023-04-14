import Model, { attr } from '@ember-data/model';

export const TYPE_COMMAND = 'Command';
export const TYPE_FRONTLINE = 'Frontline';
export const TYPE_HQ = 'HQ';
export const TYPE_LOGISTICS = 'Logistics';
export const TYPE_MENTORING = 'Mentoring';
export const TYPE_OTHER = 'Other';
export const TYPE_TRAINING = 'Training';

export const TEAM_CATEGORY_ALL_MEMBERS = 'all_members';
export const TEAM_CATEGORY_OPTIONAL  = 'optional';
export const TEAM_CATEGORY_PUBLIC = 'public';

export const TeamCategoryLabels = {
  [TEAM_CATEGORY_ALL_MEMBERS]: 'All Members',
  [TEAM_CATEGORY_OPTIONAL]: 'Optional',
  [TEAM_CATEGORY_PUBLIC]: 'Public',
}

export default class PositionModel extends Model {
  @attr('string') title;
  @attr('boolean', { defaultValue: false }) new_user_eligible;
  @attr('boolean', { defaultValue: false }) all_rangers;
  @attr('boolean', { defaultValue: false }) count_hours;

  @attr('boolean', { defaultValue: false }) is_team;
  @attr('number') team_id;
  @attr('string', {defaultValue: TEAM_CATEGORY_OPTIONAL }) team_category;

  @attr('boolean', { defaultValue: false }) require_training_for_roles;

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
  @attr('boolean', { defaultValue:false}) alert_when_becomes_empty;
  @attr('boolean', { defaultValue:false}) alert_when_no_trainers;

  @attr('string') resource_tag;

  // Paycom employee paycode
  @attr('string') paycode;

  get teamCategoryLabel() {
    return TeamCategoryLabels[this.team_category] ?? this.team_category;
  }
}
