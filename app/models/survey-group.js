import Model, {attr} from '@ember-data/model';

export default class SurveyGroupModel extends Model {
  @attr('number') sort_index;
  @attr('number') survey_id;
  @attr('string') title;
  @attr('string') description;
  @attr('boolean') is_trainer_group;

  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;
}
