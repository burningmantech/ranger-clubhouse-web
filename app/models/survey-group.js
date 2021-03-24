import Model, {attr} from '@ember-data/model';

// Group is nothing special, presented with the main report.
export const TYPE_NORMAL = 'normal';
// The group questions are repeated for each trainer who taught
export const TYPE_TRAINER = 'trainer';
// The group is separated out from the main report, and presented it's own thing.
// with each slot
export const TYPE_SEPARATE = 'separate-slot';
// The group is separated out from the main report and summarized
// (e.g., the manual review)
export const TYPE_SUMMARY = 'separate-summary';

export default class SurveyGroupModel extends Model {
  @attr('number') sort_index;
  @attr('number') survey_id;
  @attr('string') title;
  @attr('string') description;
  @attr('string', {default: TYPE_NORMAL}) type;
  @attr('string') report_title;

  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;
}
