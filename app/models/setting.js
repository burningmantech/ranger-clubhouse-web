import DS from 'ember-data';
const { Model } = DS;
import { computed } from '@ember/object';
const { attr } = DS;

export default class SettingModel extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('string') type;
  @attr('string') options;
  @attr('string') value;
  @attr('boolean') is_encrypted;
  @attr('string', { readOnly: true }) config_value;

  @computed('description')
  get shortDescription() {
    return this.description.split("\n")[0];
  }
}
