import Model, { attr } from '@ember-data/model';

export const EventPeriodLabels = {
  'pre': 'Pre-Event',
  'event': 'Event Week',
  'post': 'Post-Event',
};

export default class EventDateModel extends Model {
  @attr('shiftdate') event_end;
  @attr('shiftdate') event_start;
  @attr('shiftdate') post_event_end;
  @attr('shiftdate') pre_event_slot_end;
  @attr('shiftdate') pre_event_slot_start;
  @attr('shiftdate') pre_event_start;
}
