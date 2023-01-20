import Model, { attr } from '@ember-data/model';

export default class RoleModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
  @attr('') teams;
  @attr('') positions;
}
