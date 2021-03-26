import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import moment from 'moment';
import {ALPHA} from 'clubhouse/constants/positions';

const DT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default class MentorAlphaSignoutController extends ClubhouseController {
  @tracked isLoading = false;
  @tracked alphaSignout = null;
  @tracked alphas = [];
  @tracked shiftDate = null;
  @tracked selectAll = false;

  @tracked alphaSignoutIndex = 0;
  @tracked alphaSignoutCount = 0;

  @action
  changeSlot(value) {
    if (value === '') {
      return; // Do nothing
    }

    this.isLoading = true;
    this.shiftDate = value;
    const data = {
      position_id: ALPHA,
      is_on_duty: 1
    };

    if (this.shiftDate !== 'all') {
      data.on_duty_start = moment(value).subtract(1, 'hours').format(DT_FORMAT);
      data.on_duty_end = moment(value).add(1, 'hours').format(DT_FORMAT);
    }

    this.ajax.request('timesheet', {data})
      .then((result) => {
        this.alphas = result.timesheet.map((t) => ({
          id: t.person_id,
          callsign: t.person.callsign,
          selected: true,
          on_duty: t.on_duty,
          duration: t.duration,
          timesheet_id: t.id
        }));
        this.selectAll = true;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  @action
  toggleAll(event) {
    const selected = event.target.checked;
    this.alphas.forEach((alpha) => {
      if (!alpha.off_duty) {
        set(alpha, 'selected', selected);
      }
    });
  }

  @action
  async signoutAction() {
    const alphas = this.alphas.filter((a) => a.selected);

    if (!alphas.length) {
      this.modal.info(null, 'No Alphas selected.');
      return;
    }

    this.alphaSignoutCount = alphas.length;

    let errors = 0;
    for (let i = 0; i < alphas.length; i++) {
      const alpha = alphas[i];
      this.alphaSignout = alpha;
      this.alphaSignoutIndex = i + 1;
      try {
        const result = await this.ajax.request(`timesheet/${alpha.timesheet_id}/signoff`, {method: 'POST'});
        switch (result.status) {
          case 'already-signed-off':
            set(alpha, 'error', 'Already signed out');
            errors++;
            break;

          case 'success':
            set(alpha, 'selected', false);
            break;

          default:
            set(alpha, 'error', `Unknown status response [${result.status}]`);
            break;
        }

        const {timesheet} = result;
        if (timesheet) {
          set(alpha, 'off_duty', timesheet.off_duty);
          set(alpha, 'duration', timesheet.duration);
        }
      } catch (e) {
        errors++;
        set(alpha, 'error', `Server error - ${e}`);
      } finally {
        this.alphaSignout = null;
      }
    }

    if (errors) {
      this.modal.info('Error signing out Alphas', `${errors} Alpha(s) were NOT signed out. Check the table for error messages.`);
    } else {
      this.modal.info('Success!', `${alphas.length} were successfully signed out.`);
    }
  }
}
