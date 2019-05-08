import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import moment from 'moment';

export default class ReportsShiftLeadController extends Controller {
  queryParams = ['year'];

  @action
  changeShift(option) {
    this.set('shiftSelect', option);
    if (option == '') {
      return;
    }

    const [shift_start, shift_duration] = option.split('#');
    this.set('shiftStart', shift_start);

    this.set('isLoading', true);
    this.ajax.request('slot/shift-lead-report', { data: { shift_start, shift_duration } })
      .then((result) => this.setProperties(result))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isLoading', false));
  }

  @computed('dirtShiftTimes')
  get shiftOptions() {
    const options = [
      { id: '', title: 'Select a shift' }
    ];

    this.dirtShiftTimes.forEach((shift) => {
      options.push({ id: `${shift.shift_start}#${shift.duration}`, title: moment(shift.shift_start).format("ddd MMM D @ HH:mm") });
    });

    return options;
  }
}
