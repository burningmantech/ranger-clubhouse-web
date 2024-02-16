import Model, {attr} from '@ember-data/model';

export const TYPE_RRN = 'rrn';
export const TYPE_VC = 'vc';
export const TYPE_VC_FLAG = 'vc-flag';
export const TYPE_VC_COMMENT = 'vc-comment';

export default class ProspectiveApplicationModel extends Model {
  @attr('string') type;
  @attr('string') note;
  @attr('number')person_id;
  @attr('', {readOnly: true}) person;
  @attr('string') updated_at;
  @attr('string') created_at;
}
