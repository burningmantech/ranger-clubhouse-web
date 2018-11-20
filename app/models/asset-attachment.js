import DS from 'ember-data';
const { Model } = DS;
import { attr } from '@ember-decorators/data';

export default class AssetAttachmentModel extends Model {
  @attr('string') description;
  @attr('string') parent_type;
}
