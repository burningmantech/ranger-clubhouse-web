import DS from 'ember-data';
import { computed } from '@ember-decorators/object';
import { attr } from '@ember-decorators/data';

const { Model } = DS;


export default class MotdModel extends Model {
  @attr('number') person_id;
  @attr('string') message;
  @attr('boolean') is_alert;
  @attr('') updated_at;
  @attr('') created_at;

  @attr('', { readOnly: true }) person;

  @computed('created_at', 'updated_at')
  get isModified() {
    return this.created_at != this.updated_at;
  }
}
