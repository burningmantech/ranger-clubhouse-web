import Model, {attr} from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export const TYPE_SHIFT = 'shift';     // Normal shift, dirt pair or group
export const TYPE_MENTOR = 'mentor';   // Alpha mentor pod
export const TYPE_ALPHA = 'alpha';     // Alpha pod, either pair or triad
export const TYPE_MITTEN = 'mitten';   // Alpha mentor-in-training pod

export default class PodModel extends Model {
  @attr('string') type;
  @attr('date') formed_at;
  @attr('date') disbanded_at;
  @attr('number') slot_id;
  @attr('number') mentor_pod_id;
  @attr('number', {defaultValue: 0}) person_count;
  @attr('boolean', { defaultValue: false }) is_lead;
  @attr('number', {defaultValue: 0 }) sort_index;

  @attr('', { readOnly: true }) people;
  @attr('', { readOnly: true }) past_people;

  @tracked alphaPod;
  @tracked mittenPod;
}
