import DS from 'ember-data';
const { Model } = DS;
const { attr } = DS;

export default class AssetAttachmentModel extends Model {
  @attr('string') description;
  @attr('string') parent_type;
}
