import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

const { Model } = DS;

export default class EventDateModel extends Model {
  @attr('shiftdate') event_end;
  @attr('shiftdate') event_start;
  @attr('shiftdate') post_event_end;
  @attr('shiftdate') pre_event_slot_end;
  @attr('shiftdate') pre_event_slot_start;
  @attr('shiftdate') pre_event_start;
}
