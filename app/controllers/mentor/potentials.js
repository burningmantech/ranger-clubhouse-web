import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MentorPotentialsController extends Controller {
  @tracked untrained;
  @tracked blackFlagged;
  @tracked rrnFlagged;
  @tracked vcFlagged;
  @tracked trainingFlagged;
  @tracked mentorFlagged;
  @tracked blackFlagged;

  get viewPotentials() {
    let potentials = this.potentials;

    if (this.untrained) {
      potentials = potentials.filter((p) => !p.trained);
    }

    if (this.blackFlagged) {
      potentials = potentials.filter((p) => p.black_flag);
    }

    if (this.rrnFlagged) {
      potentials = potentials.filter((p) => (p.rrn_ranks ? p.rrn_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.vcFlagged) {
      potentials = potentials.filter((p) => (p.vc_ranks ? p.vc_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.mentorFlagged) {
      potentials = potentials.filter((p) => p.mentor_team.find((m) => m.rank >= 3));
    }

    return potentials;
  }

  @action
  noteSubmitted(person) {
    return this.ajax.request(`intake/${person.id}/history`, {method: 'GET', data: {year: this.house.currentYear()}})
      .then((result) => {
        this.set('potentials', this.potentials.map((p) => (p == person ? result.person : p)))
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }
}
