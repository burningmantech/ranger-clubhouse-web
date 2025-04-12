import Model, {attr} from '@ember-data/model';

// Only used for helping to administrator award forms.
export const TYPE_TEAM = 'team';
export const TYPE_SPECIAL = 'award';
export const TYPE_POSITION = 'position';

export const REBUILD_INFO = '<p>' +
  'This operation will attempt to find any missing team and position recognitions awards. ' +
  'For trainer positions, a trainer attendance record must exist and the person marked as having attended. Trainers signed up only ' +
  'as trainees will not be included. ' +
  'For all other positions, a timesheet entry must exist for each year to be recognitized.' +
  '</p>' +
  '<p class="text-danger">Existing position awards that cannot be verified by a trainer status record or timesheet entry will be removed.</p>' +
  'Are you sure you want to proceed?';

export default class PersonAwardModel extends Model {
  @attr('number') person_id;
  @attr('number') award_id;
  @attr('number') position_id;
  @attr('number') team_id;
  @attr('number') year;
  @attr('string') notes;
  @attr('boolean', { defaultValue: false }) awards_grants_service_year;

  @attr('date', {readOnly: true}) created_at;
  @attr('date', {readOnly: true}) updated_at;

  @attr('', {readOnly: true}) award;
  @attr('', {readOnly: true}) creator_person;
  @attr('', {readOnly: true}) position;
  @attr('', {readOnly: true}) team;


  get title() {
    let title = null;
    if (this.award_id) {
      title = this.award?.title;
    } else if (this.position_id) {
      title = this.position?.title;
    } else if (this.team_id) {
      title = this.team?.title;
    }

    return title ? title : 'No associated record?';
  }

  get type() {
    if (this.award_id) {
      return TYPE_SPECIAL;
    } else if (this.position_id) {
      return TYPE_POSITION;
    } else if (this.team_id) {
      return TYPE_TEAM;
    }

    return 'unknown';
  }
}
