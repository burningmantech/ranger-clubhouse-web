import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import Selectable from 'clubhouse/utils/selectable';

class Candidate extends Selectable {
  @tracked didGraduate = false;
  @tracked reason;

  constructor(row) {
    super(row);
    this.selected = true;
  }
}

export default class ArtTrainingGraduateComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isLoading = true;

  @tracked positions;
  @tracked fullyGraduatedPosition;

  @tracked candidates = [];
  @tracked ineligible = [];
  @tracked graduated = [];

  constructor() {
    super(...arguments);

    this.ajax.request(`training-session/${this.args.slot.id}/graduation-candidates`)
      .then(({people, positions, fully_graduated_position}) => {
        this.positions = positions;
        this.positionTitles = positions.map((p) => p.title).join(', ');

        this.fullyGraduatedPosition = fully_graduated_position;
        people.forEach((person) => {
          switch (person.eligibility) {
            case 'auditor':
              this.ineligible.push({person, reason: 'Is an auditor'});
              break;
            case 'candidate':
              this.candidates.push(new Candidate({person}));
              break;
            case 'graduated':
              this.graduated.push({person, reason: `Already has the position(s): ${this.positionTitles}`});
              break;
            case 'fully-graduated':
              this.graduated.push({person, reason: `Already has the position: ${this.fullyGraduatedPosition.title}`});
              break;
            case 'not-passed':
              this.ineligible.push({person, reason: 'Has not been marked as passed'});
              break;
            default:
              this.ineligible.push({
                person,
                reason: `BUG: Sorry, the server responded with the unknown status ${person.eligibility}.`
              });
              break;
          }
        })
      })
      .catch((response) => {
        this.house.handleErrorResponse(response);
        this.args.onCancel();
      })
      .finally(() => this.isLoading = false)
  }

  @cached
  get selectedCount() {
    return this.candidates.reduce((total, c) => (c.selected ? 1 : 0) + total, 0);
  }

  @action
  saveGraduateAction() {
    const ids = this.candidates.filter((c) => c.selected).map((c) => c.person.id);

    this.modal.confirm('Confirm Trainee Graduation', `Are you absolutely sure you want to graduate ${ids.length} trainee(s)?`,
      () => this._graduateCandidates(ids));
  }

  _graduateCandidates(ids) {
    this.isSubmitting = true;
    this.ajax.request(`training-session/${this.args.slot.id}/graduate-candidates`, {method: 'POST', data: {ids}})
      .then(({people}) => {
        people.forEach(({id, status}) => {
          const candidate = this.candidates.find((c) => c.person.id === id);
          if (!candidate) {
            return;
          }
          if (status === 'success') {
            candidate.selected = false;
            candidate.didGraduate = true;
            candidate.reason = `Granted: ${this.positionTitles}`;
          } else {
            candidate.reason = `Could not graduate the person. status [${status}]`;
          }
        })
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
