import DS from 'ember-data';
import { computed } from '@ember/object';
const { attr } = DS;
import { isEmpty } from '@ember/utils';
import { ticketTypeLabel } from 'clubhouse/constants/ticket-types';
import { BmidStatusLabels, MealLabels } from 'clubhouse/constants/bmid';

import moment from 'moment';

const { Model } = DS;

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
  @attr('string', { readOnly: true }) create_datetime;
  @attr('string', { readOnly: true }) modified_datetime;

  @attr('string') access_date;
  @attr('boolean') access_any_time;

  @attr('', { readOnly: true }) person;
  @attr('number', { readOnly: true }) wap_id;
  @attr('string', { readOnly: true }) wap_status;
  @attr('string', { readOnly: true }) wap_type;
  @attr('boolean', { readOnly: true }) has_signups;

  @computed('access_date', 'access_any_time')
  get admission_date() {
    if (this.access_any_time) {
      return 'any';
    } else {
      if (this.access_date) {
        return moment(this.access_date).format('YYYY-MM-DD');
      } else {
        return null;
      }
    }
  }

  @computed('access_date', 'access_any_time')
  get admissionDateShort() {
    if (this.access_any_time) {
      return 'any';
    } else {
      if (this.access_date) {
        return moment(this.access_date).format('ddd, M/DD');
      } else {
        return '(no date)';
      }
    }
  }



  set admission_date(value) {
    if (value == 'any') {
      this.set('access_any_time', true);
      this.set('access_date', null);
    } else {
      this.set('access_any_time', false);
      this.set('access_date', value);
    }
  }

  @computed('access_date', 'access_any_time')
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

    return moment(this.access_date).valueOf();
  }

  @computed('wap_status', 'wap_id')
  get wapDisabled() {
    return !this.wap_id || this.wap_status == 'submitted';
  }

  @computed('wap_status', 'wap_id')
  get wapMissing() {
    return !this.wap_id;
  }

  @computed('wap_status')
  get wapSubmitted() {
    return this.wap_status == 'submitted';
  }

  @computed('wap_type')
  get wapTypeHuman() {
    return ticketTypeLabel[this.wap_type] || this.wap_type;
  }

  @computed('meals')
  get mealsHuman() {
    return (isEmpty(this.meals) ? 'None' : (MealLabels[this.meals] || this.meals));
  }

  @computed('status')
  get statusHuman() {
    return (BmidStatusLabels[this.status] || `Unknown status ${this.status}`);
  }
}
