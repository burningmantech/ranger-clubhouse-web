import Model, {attr} from '@ember-data/model';
import {tracked} from '@glimmer/tracking';

export const TYPE_SHIFT = 'shift';     // Normal shift, dirt pair or group
export const TYPE_MENTOR = 'mentor';   // Alpha mentor pod
export const TYPE_ALPHA = 'alpha';     // Alpha pod, either pair or triad
export const TYPE_MITTEN = 'mitten';   // Alpha mentor-in-training pod

export const TRANSPORT_FOOT = 'foot'; // On foot
export const TRANSPORT_BICYCLE = 'bicycle'; // Bike mobile
export const TRANSPORT_VEHICLE = 'vehicle'; // In a vehicle

export const TransportOptions = [
  ['On Foot', TRANSPORT_FOOT],
  ['Bike Mobile', TRANSPORT_BICYCLE],
  ['In Vehicle', TRANSPORT_VEHICLE]
];

export const TransportLabels = {
  [TRANSPORT_FOOT]: 'On Foot',
  [TRANSPORT_BICYCLE]: 'Bike Mobile',
  [TRANSPORT_VEHICLE]: 'In Vehicle'
};

export const TransportIcons = {
  [TRANSPORT_FOOT]: 'person-walking',
  [TRANSPORT_BICYCLE]: 'bicycle',
  [TRANSPORT_VEHICLE]: 'truck-pickup'
};

export default class PodModel extends Model {
  @attr('string') type;
  @attr('date') formed_at;
  @attr('date') disbanded_at;
  @attr('number') slot_id;
  @attr('number') mentor_pod_id;
  @attr('number', {defaultValue: 0}) person_count;
  @attr('boolean', {defaultValue: false}) is_lead;
  @attr('number', {defaultValue: 0}) sort_index;
  @attr('string', {defaultValue: TRANSPORT_FOOT}) transport;
  @attr('string') location;

  @attr('', {readOnly: true}) people;
  @attr('', {readOnly: true}) past_people;

  @tracked alphaPod;
  @tracked mittenPod;

  get transportLabel() {
    return TransportLabels[this.transport] ?? this.transport;
  }

  get transportIcon() {
    return TransportIcons[this.transport] ?? 'question';
  }
}
