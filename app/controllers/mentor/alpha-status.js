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

  @computed('filter', 'potentials')
  get viewPotentials() {
    const potentials = this.potentials;

    switch (this.filter) {
    case 'status':
      return potentials.filter((p) => p.status_eligible);
    case 'position':
      return potentials.filter((p) => p.position_eligible);
    case 'both':
      return potentials.filter((p) => p.status_eligible && p.position_eligible);

    case 'alpha':
      return potentials.filter((p) => p.status == 'alpha');

    case 'mentor-flag':
      return potentials.filter((p) => p.mentors_flag);

    default:
      return potentials;
    }
  }

  @computed('potentials')
  get statusEligibleCount() {
    return this.potentials.reduce((total,p) => (p.status_eligible ? 1 : 0)+total, 0);
  }

  @computed('potentials')
  get positionEligibleCount() {
    return this.potentials.reduce((total,p) => (p.position_eligible ? 1 : 0)+total, 0);
  }

  @computed('potentials')
  get alphaCount() {
    return this.potentials.reduce((total,p) => (p.status == 'alpha' ? 1 : 0)+total, 0);
  }
}
