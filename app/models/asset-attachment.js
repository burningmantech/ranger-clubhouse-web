import Model, { attr } from '@ember-data/model';

export default class AssetAttachmentModel extends Model {
  @attr('string') description;
  @attr('string') parent_type;
}
