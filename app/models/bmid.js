import Model, {attr} from '@ember-data/model';
import {isEmpty} from '@ember/utils';
import {ticketTypeLabel} from 'clubhouse/constants/ticket-types';
import dayjs from 'dayjs';
import {NON_RANGER} from "clubhouse/constants/person_status";

export const MEALS_ALL = 'all';
export const MEALS_EVENT = 'event';
export const MEALS_EVENT_PLUS_POST = 'event+post';
export const MEALS_POST = 'post';
export const MEALS_PRE = 'pre';
export const MEALS_PRE_PLUS_EVENT = 'pre+event';
export const MEALS_PRE_PLUS_POST = 'pre+post';

// BMID is being prepped (may or may not exist in the database)
export const IN_PREP = 'in_prep';
// Ready to be sent off to be printed
export const READY_TO_PRINT = 'ready_to_print';
// BMID was changed (name, photos, titles, etc.) and needs to be reprinted
export const READY_TO_REPRINT_CHANGE = 'ready_to_reprint_changed';
// BMID was lost and a new one issued
export const READY_TO_REPRINT_LOST = 'ready_to_reprint_lost';
// BMID has issues, do not print.
export const ISSUES = 'issues';
// Person is not rangering this year (common) or another reason.
export const DO_NOT_PRINT = 'do_not_print';
// BMID was submitted
export const SUBMITTED = 'submitted';

export const BmidStatusLabels = {
  [IN_PREP]: 'Prep',
  [DO_NOT_PRINT]: 'Do Not Print',
  [READY_TO_PRINT]: 'Ready To Print',
  [READY_TO_REPRINT_LOST]: 'Ready To Reprint (Lost)',
  [READY_TO_REPRINT_CHANGE]: 'Ready To Reprint (Changed)',
  [ISSUES]: 'Issues',
  [SUBMITTED]: 'Submitted',
};

export const BmidStatusOptions = [
  ['Prep', IN_PREP],
  ['Do Not Print', DO_NOT_PRINT],
  ['Ready To Print', READY_TO_PRINT],
  ['Issues', ISSUES],
  ['Submitted', SUBMITTED],
  {
    groupName: 'Deprecated',
    options: [
      ['Ready To Reprint (Lost)', READY_TO_REPRINT_LOST],
      ['Ready To Reprint (Changed)', READY_TO_REPRINT_CHANGE],
    ]
  }
];

export const MealLabels = {
  [MEALS_PRE]: 'Pre-Event',
  [MEALS_POST]: 'Post-Event',
  [MEALS_EVENT]: 'Event Week',
  [MEALS_ALL]: 'All Eats',
  [MEALS_PRE_PLUS_POST]: 'Pre-Event / Post-Event',
  [MEALS_PRE_PLUS_EVENT]: 'Pre-Event / Event Week',
  [MEALS_EVENT_PLUS_POST]: 'Event Week / Post-Event',
};

export const MealOptions = [
  ['None', ''],
  ['Pre', MEALS_PRE],
  ['Post', MEALS_POST],
  ['Event', MEALS_EVENT],
  ['All', MEALS_ALL],
  ['Pre+Post', MEALS_PRE_PLUS_POST],
  ['Pre+Event', MEALS_PRE_PLUS_EVENT],
  ['Event+Post', MEALS_EVENT_PLUS_POST]
];

export const ShowerOptions = [
  ['No', false],
  ['Yes', true],
];

export default class BmidModel extends Model {
  @attr('number') person_id;
  @attr('string') status;
  @attr('number') year;
  @attr('string') title1;
  @attr('string') title2;
  @attr('string') title3;
  @attr('boolean') showers;
  @attr('boolean') org_vehicle_insurance;
  @attr('string') meals;
  @attr('string') batch;
  @attr('string') team;
  @attr('string') notes;
  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;

  @attr('', {readOnly: true}) person;

  // Retrieved and updated from the Staff Credential or WAP
  @attr('string') access_date;
  @attr('boolean') access_any_time;
  @attr('number', {readOnly: true}) wap_id;
  @attr('string', {readOnly: true}) wap_status;
  @attr('string', {readOnly: true}) wap_type;

  // True if the person is signed up for shifts
  @attr('boolean', {readOnly: true}) has_signups;

  // True if the person has an approved photo
  @attr('boolean', {readOnly: true}) has_approved_photo;

  // Pulled from claimed or submitted provisions
  @attr('string', {readOnly: true}) earned_meals;
  @attr('boolean', {readOnly: true}) earned_showers;

  // Allocated provisions are always used if present
  @attr('string', {readOnly: true}) allocated_meals;
  @attr('boolean', {readOnly: true}) allocated_showers;

  // BMID qualifiers
  @attr('boolean', {readOnly: true}) has_ticket;
  @attr('boolean', {readOnly: true}) training_signed_up;

  get admission_date() {
    if (this.access_any_time) {
      return 'any';
    } else {
      if (this.access_date) {
        return dayjs(this.access_date).format('YYYY-MM-DD');
      } else {
        return null;
      }
    }
  }

  get admissionDateShort() {
    if (this.access_any_time) {
      return 'any';
    } else {
      if (this.access_date) {
        return dayjs(this.access_date).format('ddd, M/DD');
      } else {
        return '(no date)';
      }
    }
  }

  set admission_date(value) {
    if (value === 'any') {
      this.access_any_time = true;
      this.access_date = null;
    } else {
      this.access_any_time = false;
      this.access_date = value;
    }
  }

  get access_date_sortable() {
    if (this.wapMissing) {
      return 0;
    }

    if (this.access_any_time) {
      return 1;
    }

    if (isEmpty(this.access_date)) {
      return -1;
    }

    return dayjs(this.access_date).valueOf();
  }

  get wapDisabled() {
    return !this.wap_id || this.wap_status === 'submitted';
  }

  get wapMissing() {
    return !this.wap_id;
  }

  get wapSubmitted() {
    return this.wap_status === 'submitted';
  }

  get wapBanked() {
    return this.wap_status === 'banked';
  }

  get wapTypeHuman() {
    return ticketTypeLabel[this.wap_type] || this.wap_type;
  }

  get mealsHuman() {
    return (isEmpty(this.meals) ? 'None' : (MealLabels[this.meals] || this.meals));
  }

  get effectiveMealsHuman() {
    const meals = this.effectiveMeals;
    return (isEmpty(meals) ? 'None' : (MealLabels[meals] || meals));
  }

  get statusHuman() {
    return (BmidStatusLabels[this.status] || `Unknown status ${this.status}`);
  }

  get effectiveMeals() {
    if (this.meals === MEALS_ALL
      || this.earned_meals === MEALS_ALL
      || this.allocated_meals === MEALS_ALL) {
      return MEALS_ALL;
    }

    const matrix = [];

    if (this.meals) {
      this.meals.split('+').forEach((meal) => matrix[meal] = true);
    }

    if (this.earned_meals) {
      this.earned_meals.split('+').forEach((meal) => matrix[meal] = true);
    }

    if (this.allocated_meals) {
      this.allocated_meals.split('+').forEach((meal) => matrix[meal] = true);
    }

    if (Object.keys(matrix).length === 3) {
      return MEALS_ALL;
    }

    const sorted = [];
    if (matrix[MEALS_PRE]) {
      sorted.push(MEALS_PRE);
    }

    if (matrix[MEALS_EVENT]) {
      sorted.push(MEALS_EVENT);
    }

    if (matrix[MEALS_POST]) {
      sorted.push(MEALS_POST);
    }

    return sorted.join('+');
  }

  get effectiveShowers() {
    return !!(this.showers || this.earned_showers || this.allocated_showers);
  }

  get qualifiedToPrint() {
    return this.status === IN_PREP || this.status === READY_TO_PRINT;
  }

  get isSubmitted() {
    return this.status === SUBMITTED;
  }

  get willNotPrint() {
    return this.status === DO_NOT_PRINT || this.status === ISSUES;
  }

  get notQualifiedToPrint() {
    if (this.person?.status === NON_RANGER) {
      return !this.has_signups;
    } else {
      return !this.has_ticket && !this.training_signed_up;
    }
  }
}
