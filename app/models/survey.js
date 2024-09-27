import Model, {attr} from '@ember-data/model';
import optionsToLabels from "clubhouse/utils/options-to-labels";

export const TYPE_TRAINER = 'trainer';
export const TYPE_TRAINING = 'training';
export const TYPE_ALPHA = 'alpha';
export const TYPE_MENTOR_FOR_MENTEES = 'mentor-for-mentees'; // rate mentees by the mentors
export const TYPE_MENTEES_FOR_MENTOR = 'mentees-for-mentor'; // rate the mentors by the mentees

export const TrainerTypeOptions = [
  [ 'Trainee-for-Training Survey', TYPE_TRAINING ],
  [ 'Trainer-for-Trainer Survey', TYPE_TRAINER ],
];

export const AlphaTypeOptions = [
  [ 'Alpha Feedback for Mentor Survey', TYPE_ALPHA ],
];

export const ARTTypeOptions = [
  [ 'ART Mentor Feedback for ART Mentees Survey', TYPE_MENTOR_FOR_MENTEES ],
  [ 'ART Mentees Feedback for ART Mentors Survey', TYPE_MENTEES_FOR_MENTOR ],
];

export const TypeLabels = optionsToLabels([...AlphaTypeOptions, ...ARTTypeOptions, ...TrainerTypeOptions]);

export default class SurveyModel extends Model {
  @attr('boolean') active;
  @attr('number') year;
  @attr('string') type;
  @attr('number') position_id;
  @attr('string') position_title;
  @attr('number') mentoring_position_id;
  @attr('string') mentoring_position_title;
  @attr('string') title;
  @attr('string') prologue;
  @attr('string') epilogue;
  @attr('string', {readOnly: true}) updated_at;
  @attr('string', {readOnly: true}) created_at;

  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }
}
