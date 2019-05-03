import DS from 'ember-data';
const { attr } = DS;

export default class AlertModel extends DS.Model {
  @attr('string') title;
  @attr('string') description;
  @attr('boolean') on_playa;
  @attr('date') created_at;
  @attr('date') updated_at;
}
