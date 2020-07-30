import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class MotdModel extends Model {
  @attr('number') person_id;
  @attr('string') subject;
  @attr('string') message;
  @attr('boolean') for_pnvs;
  @attr('boolean') for_auditors;
  @attr('boolean') for_rangers;
  @attr('string') updated_at;
  @attr('string') created_at;
  @attr('string') expires_at;

  @attr('', { readOnly: true }) person;
  @attr('boolean', { readOnly: true}) has_read;
  @attr('boolean', { readOnly: true}) has_expired;

  @computed('created_at', 'updated_at')
  get isModified() {
    return this.created_at != this.updated_at;
  }
}
