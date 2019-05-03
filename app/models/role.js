import DS from 'ember-data';
const { attr } = DS;
const { Model } = DS;

export default class RoleModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
}
