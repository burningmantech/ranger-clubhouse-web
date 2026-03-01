import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import Selectable from 'clubhouse/utils/selectable';
import {pluralize} from 'ember-inflector';

class Candidate extends Selectable {
  @tracked didGraduate = false;
  @tracked reason;
  @tracked missingRequirements = false;

  constructor(row) {
    super(row);
    this.selected = !this.missingRequirements;
  }
}

const ELIGIBILITY_AUDITOR = 'auditor';
const ELIGIBILITY_FULLY_GRADUATED = 'fully-graduated';
const ELIGIBILITY_GRADUATED = 'graduated';
const ELIGIBILITY_CANDIDATE = 'candidate';
const ELIGIBILITY_NOT_PASSED = 'not-passed';
const ELIGIBILITY_REQUIREMENTS_INCOMPLETE = 'requirements-incomplete';

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
    this.load();
  }

  async load() {
    try {
      const {people, positions, fully_graduated_position} = await this.ajax.request(
        `training-session/${this.args.slot.id}/graduation-candidates`
      );
      this.positions = positions;
      this.positionTitles = positions.map((p) => p.title).join(', ');
      this.fullyGraduatedPosition = fully_graduated_position;
      people.forEach((person) => {
        switch (person.eligibility) {
          case ELIGIBILITY_AUDITOR:
            this.ineligible.push({person, reason: 'Is an auditor'});
            break;
          case ELIGIBILITY_CANDIDATE:
            this.candidates.push(new Candidate({person}));
            break;
          case ELIGIBILITY_GRADUATED:
            this.graduated.push({person, reason: `Already has the position(s): ${this.positionTitles}`});
            break;
          case ELIGIBILITY_FULLY_GRADUATED:
            this.graduated.push({person, reason: `Already has the position: ${this.fullyGraduatedPosition.title}`});
            break;
          case ELIGIBILITY_NOT_PASSED:
            this.ineligible.push({person, reason: 'Has not been marked as passed'});
            break;
          case ELIGIBILITY_REQUIREMENTS_INCOMPLETE: {
            const missingRequirements = [];
            if (person.shifts < person.req_shifts) {
              missingRequirements.push(`Has only ${pluralize(person.shifts, 'eligible shift')}. The minimum is ${pluralize(person.req_shifts, 'shift')}`);
            }
            if (person.hours < person.req_hours) {
              missingRequirements.push(`Has only ${pluralize(person.hours, 'eligible hour')}. The minimum is ${pluralize(person.req_hours, 'eligible hour')}`);
            }
            if (person.events < person.req_events) {
              missingRequirements.push(`Has only volunteered for ${pluralize(person.events, 'event')} (excluding the current event). The minimum is ${pluralize(person.req_events, 'event')}`);
            }
            this.candidates.push(new Candidate({person, missingRequirements: missingRequirements}));
          }
            break;

          default:
            this.ineligible.push({
              person,
              reason: `BUG: Sorry, the server responded with the unknown status ${person.eligibility}.`
            });
            break;
        }
      });
    } catch (response) {
      this.house.handleErrorResponse(response);
      this.args.onCancel();
    } finally {
      this.isLoading = false;
    }
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

  async _graduateCandidates(ids) {
    this.isSubmitting = true;
    try {
      const {people} = await this.ajax.request(
        `training-session/${this.args.slot.id}/graduate-candidates`,
        {method: 'POST', data: {ids}}
      );
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
      });
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
