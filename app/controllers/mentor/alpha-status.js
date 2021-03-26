import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';

export default class MentorAlphaStatusController extends ClubhouseController {
  @tracked filter = 'all';
  @tracked mentees;

  filterOptions = [
    [ 'All', 'all' ],
    [ 'Status eligible', 'status' ],
    [ 'Position eligible', 'position' ],
    [ 'Status & Position eligible', 'both' ],
    [ 'Alpha status', 'alpha' ],
    [' Mentor Flagged', 'mentor-flag' ]
  ];

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

  get statusEligibleCount() {
    return this.mentees.reduce((total,p) => (p.status_eligible ? 1 : 0)+total, 0);
  }

  get positionEligibleCount() {
    return this.mentees.reduce((total,p) => (p.position_eligible ? 1 : 0)+total, 0);
  }

  get alphaCount() {
    return this.mentees.reduce((total,p) => (p.status == 'alpha' ? 1 : 0)+total, 0);
  }
}
