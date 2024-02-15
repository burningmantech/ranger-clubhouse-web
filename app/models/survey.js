import Model, {attr} from '@ember-data/model';

export const TYPE_TRAINER = 'trainer';
export const TYPE_TRAINING  = 'training';
export const TYPE_ALPHA = 'alpha';

export default class SurveyModel extends Model {
  @attr('number') year;
  @attr('string') type;
  @attr('number') position_id;
  @attr('string') title;
  @attr('string') prologue;
  @attr('string') epilogue;
  @attr('string', {readOnly: true}) updated_at;
  @attr('string', {readOnly: true}) created_at;
}
