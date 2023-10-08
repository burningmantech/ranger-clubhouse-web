import Model, {attr} from '@ember-data/model';
import optionsToLabels from "clubhouse/utils/options-to-labels";

export const COURSE_FOR_ALL = 'all';
export const COURSE_FOR_RETURNING = 'returning';
export const COURSE_FOR_NEW = 'new';

export const CourseForOptions = [
  ['All', COURSE_FOR_ALL],
  ['Returning / Veterans', COURSE_FOR_RETURNING],
  ['New / Applicant / Binary', COURSE_FOR_NEW]
];

export const CourseForLabels = optionsToLabels(CourseForOptions);

export default class OnlineCourseModel extends Model {
  @attr('string') name;
  @attr('string') course_id;
  @attr('number') position_id;
  @attr('string', {defaultValue: COURSE_FOR_ALL}) course_for;
  @attr('number') year;

  @attr('', {readOnly: true}) position;

  get courseForLabel() {
    return CourseForLabels[this.course_for] ?? this.course_for;
  }
}
