import Model, {attr} from '@ember-data/model';

export const TYPE_TEAM = 'team';
export const TYPE_CADRE = 'cadre';
export const TYPE_DELEGATION = 'delegation';

export const TypeLabels = {
  [TYPE_TEAM]: 'Team',
  [TYPE_CADRE]: 'Cadre',
  [TYPE_DELEGATION]: 'Delegation'
};

export default class TeamModel extends Model {
  @attr('string') title;
  @attr('string', {defaultValue: TYPE_TEAM}) type;
  @attr('boolean', {defaultValue: true}) active;
  @attr('boolean', {defaultValue: false}) mvr_eligible;
  @attr('boolean', {defaultValue: false}) pvr_eligible;
  @attr('boolean', {defaultValue: false}) awards_eligible;
  @attr('string') description;
  @attr('string') email;

  @attr('') role_ids;

  @attr('', {readOnly: true}) managers;
}
