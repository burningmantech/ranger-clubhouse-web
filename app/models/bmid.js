import Model, {attr} from '@ember-data/model';
import {isEmpty} from '@ember/utils';
import {ticketTypeLabel} from 'clubhouse/constants/ticket-types';
import dayjs from 'dayjs';
import {ECHELON} from "clubhouse/constants/person_status";
import {isArray} from "lodash";
import {cached, tracked} from '@glimmer/tracking';

// BMID is being prepped (may or may not exist in the database)
export const IN_PREP = 'in_prep';
// Ready to be sent off to be printed
export const READY_TO_PRINT = 'ready_to_print';
// BMID has issues, do not print.
export const ISSUES = 'issues';
// Person is not rangering this year (common) or another reason.
export const DO_NOT_PRINT = 'do_not_print';
// BMID was submitted
export const SUBMITTED = 'submitted';

// Deprecated statuses.
// BMID was changed (name, photos, titles, etc.) and needs to be reprinted
export const READY_TO_REPRINT_CHANGE = 'ready_to_reprint_changed';
// BMID was lost and a new one issued
export const READY_TO_REPRINT_LOST = 'ready_to_reprint_lost';

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
  /*
  {
    groupName: 'Deprecated',
    options: [
      ['Ready To Reprint (Lost)', READY_TO_REPRINT_LOST],
      ['Ready To Reprint (Changed)', READY_TO_REPRINT_CHANGE],
    ]
  }*/
];

export const MEALS_FULL_LABELS = {
  all: 'All Eats',
  pre: 'Pre-Event',
  event: 'Event Week',
  post: 'Post Event',
};

export const MEALS_SHORT_LABELS = {
  all: 'All Eats',
  pre: 'Pre',
  event: 'Event',
  post: 'Post',
}

export function buildMealsLabel(meals, labels, suffix = null) {
  if (meals.pre && meals.event && meals.post) {
    let label = labels.all;
    if (suffix) {
      label += ` ${suffix}`;
    }

    return label;
  }

  const periods = [];

  if (meals.pre) {
    periods.push(labels.pre);
  }

  if (meals.event) {
    periods.push(labels.event);
  }

  if (meals.post) {
    periods.push(labels.post);
  }

  if (!periods.length) {
    return 'none';
  }

  let label = periods.join(' & ');
  if (suffix) {
    label += ` ${suffix}`;
  }
  return label;
}


export default class BmidModel extends Model {
  /*
   * Hack to deal with how BMIDs are managed. Some BMIDs may not
   * exist, however, said BMIDs may have associated data (provisions, ticket / SAP)
   * that does exist. The problem arises when Model.createRecord() is called for a
   * new BMID that doesn't exist yet and the provisions need to be pushed into the store.
   * createRecord() will not call a serializer to handle this. Sigh.
   */
  static pushToStore(context, data) {
    if (isArray(data)) {
      return data.map((row) => BmidModel.createFromPayload(context, row));
    } else {
      return BmidModel.createFromPayload(context, data);
    }
  }

  static createFromPayload(context, payload) {
    if (payload.id) {
      return context.house.pushPayload('bmid', payload);
    } else {
      return context.store.createRecord('bmid', payload);
    }
  }


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

  @attr('', {readOnly: true}) meals_granted;
  @attr('boolean', {readOnly: true}) showers_granted;
  @attr('boolean', {readOnly: true}) has_allocated_provisions;

  // BMID qualifiers
  @attr('boolean', {readOnly: true}) has_ticket;
  @attr('boolean', {readOnly: true}) training_signed_up;


  @tracked showProvisionDialog;  // For the BMID management interface.

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

  get wapTypeLabel() {
    return ticketTypeLabel[this.wap_type] || this.wap_type;
  }

  get statusLabel() {
    return (BmidStatusLabels[this.status] || `Unknown status ${this.status}`);
  }

  get mealsShortLabel() {
    return buildMealsLabel(this.meals_granted, MEALS_SHORT_LABELS);
  }

  get mealsLabel() {
    return buildMealsLabel(this.meals_granted, MEALS_FULL_LABELS, 'Pass');
  }

  get noMeals() {
    const meals = this.meals_granted;
    return !meals.pre && !meals.event && !meals.post;
  }

  loadProvisions(pkg) {
    this.showers_granted = pkg.showers;
    this.meals_granted = pkg.meals;
    this.has_allocated_provisions = pkg.have_allocated;
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
    if (this.person?.status === ECHELON) {
      return !this.has_signups;
    } else {
      return !this.has_ticket && !this.training_signed_up;
    }
  }

  @cached
  get sortCallsign() {
    return this.person.callsign.toLowerCase();
  }
}
