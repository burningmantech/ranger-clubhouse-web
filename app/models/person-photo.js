import Model, { attr } from '@ember-data/model';

export default class PersonPhotoModel extends Model {
  @attr('number', { readOnly: true }) person_id;

  @attr('string') status;

  @attr('') reject_reasons;
  @attr('string') reject_message;
  @attr('', { readOnly: true }) reject_labels;

  @attr('', { readOnly: true }) analysis_details;
  @attr('string', { readOnly: true }) analysis_status;

  @attr('boolean', { readOnly: true }) is_active;

  @attr('string', { readOnly: true }) image_url;
  @attr('string', { readOnly: true }) image_filename;
  @attr('number', { readOnly: true }) width;
  @attr('number', { readOnly: true }) height;

  @attr('string', { readOnly: true }) orig_url;
  @attr('string', { readOnly: true }) orig_filename;
  @attr('number', { readOnly: true }) orig_width;
  @attr('number', { readOnly: true }) orig_height;

  @attr('', { readOnly: true }) person;
  @attr('', { readOnly: true }) review_person;
  @attr('', { readOnly: true }) edit_person;
  @attr('', { readOnly: true }) upload_person;

  @attr('', { readOnly: true }) reject_history;

  @attr('string') created_at;
  @attr('string') updated_at;
  @attr('string') uploaded_at;
  @attr('string') edited_at;
  @attr('string') reviewed_at;
}
