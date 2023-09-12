import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {ADMIN, MENTOR} from 'clubhouse/constants/roles';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonMentorsController extends ClubhouseController {
  @tracked isSubmitting = false;

  statusOptions = [
    'pass',
    'pending',
    'bonk',
    'self-bonk'
  ];

  get canUpdateMentors() {
    return this.session.hasRole([ADMIN, MENTOR]);
  }

  @action
  async updateStatus(event) {
    const assignments = [{
      person_id: this.person.id,
      status: event.newStatus,
      mentor_ids: event.mentors.map((m) => m.id)

    }];
    this.isSubmitting = true;
    try {
      await this.ajax.request('mentor/mentor-assignment', {method: 'POST', data: {assignments}});
      event.status = event.newStatus;
      this.toast.success('Mentor result was successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
