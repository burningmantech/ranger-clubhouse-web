import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';

export default class MentorPotentialsController extends ClubhouseController {
  @tracked mentees;

  @tracked untrained;
  @tracked personnelFlagged;
  @tracked rrnFlagged;
  @tracked vcFlagged;
  @tracked trainingFlagged;
  @tracked mentorFlagged;

  get filteredPeople() {
    let mentees = this.mentees;

    if (this.untrained) {
      mentees = mentees.filter((p) => !p.trained);
    }

    if (this.personnelFlagged) {
      mentees = mentees.filter((p) => p.personnel_issue);
    }

    if (this.rrnFlagged) {
      mentees = mentees.filter((p) => (p.rrn_ranks ? p.rrn_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.vcFlagged) {
      mentees = mentees.filter((p) => (p.vc_ranks ? p.vc_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.mentorFlagged) {
      mentees = mentees.filter((p) => (p.mentor_team ? p.mentor_team.find((m) => m.rank >= 3) : false));
    }

    if (this.trainingFlagged) {
      mentees = mentees.filter((p) => p.trainings.find((t) => t.training_rank >= 3));

    }

    return mentees;
  }

  @cached
  get personnelIssuesCount() {
    return this.mentees.filter((m) => m.personnel_issue).length;
  }

  @cached
  get filterNames() {
    const names = [];

    if (this.untrained) {
      names.push('Untrained');
    }

    if (this.personnelFlagged) {
      names.push('Personnel Flagged');
    }

    if (this.rrnFlagged) {
      names.push('RRN Flagged');
    }

    if (this.vcFlagged) {
      names.push('VC Flagged');
    }

    if (this.mentorFlagged) {
      names.push('Mentor Flagged');
    }

    if (this.trainingFlagged) {
      names.push('Training Flagged');
    }

    return names;
  }
}
