import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import _ from 'lodash';

// Application has missing fields.
const STATUS_INVALID = "invalid";

// An account can be created from application
const STATUS_READY = "ready";

// Account was created successfully
const STATUS_CREATED = "created";
// Could not create the account
const STATUS_CREATE_FAILED = 'create-failed';

// Conflict with an existing account with the desired callsign
const STATUS_EXISTING_CALLSIGN = 'existing-callsign';
// Conflict with a reserved callsign or operational word/phrase
const STATUS_RESERVED_CALLSIGN = 'reserved-callsign';
// An account already exists with the same BPGUID or email as the application,
// however, said account is not auditor, non-ranger, or past prospective.
const STATUS_EXISTING_BAD_STATUS = 'existing-bad-status';

const StatusOrder = [
  STATUS_READY,
  STATUS_CREATED,
  STATUS_CREATE_FAILED,
  STATUS_INVALID,
  STATUS_EXISTING_CALLSIGN,
  STATUS_RESERVED_CALLSIGN,
  STATUS_EXISTING_BAD_STATUS,
];

const StatusLabels = {
  [STATUS_CREATED]: {
    label: 'Accounts successfully created',
    icon: 'check',
    isSuccess: true,
    isCreate: true,
  },

  [STATUS_CREATE_FAILED]: {
    label: 'Account creation failure',
    icon: 'triangle-exclamation',
  },

  [STATUS_READY]: {
    label: 'Approved applications to create prospective accounts from',
    isSuccess: true,
    icon: 'check',
  },

  [STATUS_INVALID]: {
    label: 'Applications with invalid fields',
    icon: 'ban',
  },

  [STATUS_EXISTING_CALLSIGN]: {
    label: 'Applications having conflicting callsigns with existing accounts',
    icon: 'ban',
  },

  [STATUS_RESERVED_CALLSIGN]: {
    label: 'Applications with reserved or disallowed callsigns, words, or phrases',
    icon: 'ban',
  },

  [STATUS_EXISTING_BAD_STATUS]: {
    label: 'Applications associated with existing "bad status" accounts',
    icon: 'ban'
  },
}


export default class VcCreateProspectivesRoute extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked applicationGroups = [];
  @tracked haveResults = false;


  @action
  previewCreate() {
    this._submitRequest(false);
  }

  @action
  createAccounts() {
    this.modal.confirm(
      `Create Accounts`,
      `When an account is created, the application status is updated, a welcome message will be sent, and the corresponding Salesforce record updated. Are you absolutely sure you want create prospective accounts at this time?`,
      () => this._submitRequest(true)
    );
  }

  async _submitRequest(commit) {
    try {
      this.isSubmitting = true;
      const result = await this.ajax.post(`prospective-application/create-prospectives`, {data: {commit: commit ? 1 : 0}});
      if (result.status === 'auth-failed') {
        this.modal.info('Salesforce Authentication Error',
          'The backend was unable to connect to Salesforce in order to update the application records. No accounts were created.');
        return;
      } else if (result.status !== 'success') {
        this.modal.info('Unknown failure', `The backend returned the status ${result.status}`);
        return;
      }
      this.haveResults = true;
      this._sortApplications(result.applications);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  _sortApplications(applications) {
    const groups = _.groupBy(applications, 'status');

    this.applicationGroups = [];
    StatusOrder.forEach((status) => {
      if (groups[status]) {
        const label = StatusLabels[status];
        this.applicationGroups.push({
          status,
          label: label.label,
          icon: label.icon,
          isSuccess: label.isSuccess,
          applications: groups[status],
        });
        delete groups[status];
      }
    });

    // Pick up any statuses we're not familiar with. e.g., a bug.
    _.forEach(groups, (applications, status) => {
      this.applicationGroups.push({
        status,
        label: `Bug: unknown status ${status}`,
        icon: 'ban',
        applications,
      })
    });
  }
}
