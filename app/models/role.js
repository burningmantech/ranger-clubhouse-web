import Model, { attr } from '@ember-data/model';

export default class RoleModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
  @attr('') teams;
  @attr('') positions;

  @attr('string', {readOnly: true}) art_position_title;
  @attr('string', {readOnly: true}) art_role_title;
}
