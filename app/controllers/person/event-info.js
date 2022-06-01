import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';

export default class PersonEventInfoController extends ClubhouseController {
  queryParams = ['year'];

  @tracked eventInfo;
  @tracked personEvent;

  get isCurrentYear() {
    return +this.year === this.house.currentYear();
  }

  get canMarkOnlineCourseCompleted() {
    return this.session.hasRole(TECH_NINJA);
  }

  @action
  saveEvent(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save()
      .then(() => {
        this.toast.success('Person successfully saved.');
        // Reload the current user
        if (this.person.id == this.session.userId) {
          this.session.loadUser();
        }
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  markOnlineCourseCompleted()
  {
    this.modal.confirm('Confirm Mark As Completed',
      'Are you absolutely sure you want to mark this person as having completed the online course? Your actions will be logged and subject to review.',
      () => {
        this.ajax.request(`online-training/${this.person.id}/mark-completed`, { method: 'POST'})
          .then(() => {
            this.toast.success('Person has been marked as completing the online course.');
            this.ajax.request(`person/${this.person.id}/event-info`, { data: { year: this.year } })
              .then((result) => this.eventInfo = result.event_info)
              .catch((response) => this.house.handleErrorResponse(response));
          })
      });
  }
}
