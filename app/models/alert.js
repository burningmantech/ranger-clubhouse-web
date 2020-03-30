import Model, { attr } from '@ember-data/model'

export default class AlertModel extends Model {
  @attr('string') title;
  @attr('string') description;
  @attr('boolean') on_playa;
  @attr('date') created_at;
  @attr('date') updated_at;
}
