import Model, { attr } from '@ember-data/model';

export default class SettingModel extends Model {
  @attr('string') name;
  @attr('string') value;

  @attr('string', { readOnly: true} ) description;
  @attr('string', { readOnly: true} ) type;
  // options is an array
  @attr('', { readOnly: true} ) options;
  @attr('boolean', { readOnly: true} ) is_credential;
}
