import Model, {attr} from '@ember-data/model';

export default class DocumentModel extends Model {
  @attr('string') tag;
  @attr('string') description;
  @attr('string') body;
  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;
  @attr('number', {readOnly: true}) person_create_id;
  @attr('', {readOnly: true}) person_create;
  @attr('number', {readOnly: true}) person_update_id;
  @attr('', {readOnly: true}) person_update;
}
