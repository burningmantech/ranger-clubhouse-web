import DS from 'ember-data';
const { Model } = DS;
import { attr } from '@ember-decorators/data';

export default class HelpModel extends Model {
  @attr('string') slug;
  @attr('string') title;
  @attr('string') body;
  @attr('string') tags;
}
