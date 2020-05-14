import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class MentorAlphaStatusController extends Controller {
  filterOptions = [
    [ 'All', 'all' ],
    [ 'Status eligible', 'status' ],
    [ 'Position eligible', 'position' ],
    [ 'Status & Position eligible', 'both' ],
    [ 'Alpha status', 'alpha' ],
    [' Mentor Flagged', 'mentor-flag' ]
  ];

  @computed('filter', 'mentees')
  get viewPotentials() {
    const mentees = this.mentees;

    switch (this.filter) {
    case 'status':
      return mentees.filter((p) => p.status_eligible);
    case 'position':
      return mentees.filter((p) => p.position_eligible);
    case 'both':
      return mentees.filter((p) => p.status_eligible && p.position_eligible);

    case 'alpha':
      return mentees.filter((p) => p.status == 'alpha');

    case 'mentor-flag':
      return mentees.filter((p) => p.have_mentor_flags);

    default:
      return mentees;
    }
  }

  @computed('mentees')
  get statusEligibleCount() {
    return this.mentees.reduce((total,p) => (p.status_eligible ? 1 : 0)+total, 0);
  }

  @computed('mentees')
  get positionEligibleCount() {
    return this.mentees.reduce((total,p) => (p.position_eligible ? 1 : 0)+total, 0);
  }

  @computed('mentees')
  get alphaCount() {
    return this.mentees.reduce((total,p) => (p.status == 'alpha' ? 1 : 0)+total, 0);
  }
}
