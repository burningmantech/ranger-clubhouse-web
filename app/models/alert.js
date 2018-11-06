import DS from 'ember-data';
import { attr } from '@ember-decorators/data';

export default class AlertModel extends DS.Model {
  @attr('string') title;
  @attr('string') description;
  @attr('boolean') on_playa;
  @attr('date') created_at;
  @attr('date') updated_at;
}
