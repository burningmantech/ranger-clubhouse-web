import Model, { attr } from '@ember-data/model';

export default class HelpModel extends Model {
  @attr('string') slug;
  @attr('string') title;
  @attr('string') body;
  @attr('string') tags;
}
