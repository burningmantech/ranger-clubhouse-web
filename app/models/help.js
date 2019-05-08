import DS from 'ember-data';
const { Model } = DS;
const { attr } = DS;

export default class HelpModel extends Model {
  @attr('string') slug;
  @attr('string') title;
  @attr('string') body;
  @attr('string') tags;
}
