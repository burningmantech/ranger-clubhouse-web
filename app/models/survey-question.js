import Model, { attr } from '@ember-data/model';

export default class SurveyQuestionModel extends Model {
  @attr('number') sort_index;
  @attr('number') survey_id;
  @attr('number') survey_group_id;

  @attr('string') description;
  @attr('string') type;
  @attr('string') options;
  @attr('boolean') is_required;
  @attr('boolean') summarize_rating;

  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;
}
