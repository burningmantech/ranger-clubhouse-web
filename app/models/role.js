import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
const { Model } = DS;

export default class RoleModel extends Model {
  @attr('string') title;
  @attr('boolean') new_user_eligible;
}
