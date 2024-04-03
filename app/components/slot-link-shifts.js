import Component from '@glimmer/component';
import {service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const STATUS_SUCCESS = 'success';
const STATUS_NOT_CHILD = 'not-child';
const STATUS_NO_PARENT_SLOT = 'no-parent-slot';
const STATUS_MULTIPLE_SLOTS_FOUND = 'multiple-slots';

const TYPE_MULTIPLIER = 'multiplier';
const TYPE_PARENT = 'parent';

const StatusLabels = {
  [STATUS_SUCCESS]: 'success',
  [STATUS_NOT_CHILD]: 'Position is not a child of another position',
  [STATUS_NO_PARENT_SLOT]: 'No parent / mentor slot could be found',
  [STATUS_MULTIPLE_SLOTS_FOUND]: 'Multiple parent / mentor slots found. Automated linking not possible.',
}
export default class SlotLinkShiftsComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked results = [];
  @tracked didPreview;
  @tracked isSubmitting;
  @tracked didCommit;

  constructor() {
    super(...arguments);

    this.slotIds = this.args.slots.map((s) => +s.id);
    this.typeLabel = this.args.type === TYPE_MULTIPLIER ? "Sign-Up Multiplier" : "Link To Parent Shift";
    this._execute(false);
  }

  @action
  commit() {
    this.modal.confirm('Confirm Linking',
      `You are about to link the slots to their ${this.args.type === TYPE_PARENT ? 'parent' : 'sign-up multiplier'} slots. Are you sure you want to continue?`,
      () => this._execute(true));
  }

  async _execute(commit) {
    this.isSubmitting = true;
    try {
      const {slots} = await this.ajax.post(`slot/link-slots`, {
        data: {
          slot_ids: this.slotIds,
          commit: commit ? 1 : 0,
          type: this.args.type,
        }
      });
      this.results = slots;
      this.didCommit = commit;
      if (commit) {
        this.toast.success('The slots have been linked');
        this.house.scrollToTop();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  get errorCount() {
    return this.results.filter((r) => r.status !== STATUS_SUCCESS).length;
  }

  @action
  errorLabel(status) {
    return StatusLabels[status] ?? `Unknown status: ${status}`;
  }
}
