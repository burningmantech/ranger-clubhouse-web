import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const TASK_GROUPS = [{
    group_title: 'Positions',
    tasks: [{
      action: 'update-positions',
      title: 'Set Ranger Positions',
      description: 'Ensure all Rangers have the correction positions',
      controller: 'maintenance'
    }]
  },
  {
    group_title: 'Account Post Event',
    tasks: [{
        action: 'mark-off-site',
        title: 'Mark all Rangers as off-site',
        description: 'Any Ranger who was marked as on site will be marked as off site',
        controller: 'maintenance'
      },
      {
        action: 'reset-pnvs',
        title: 'Reset PNVs To Past Prospectives',
        description: 'Revert Alpha/Bonked/Prospective/Prospective Waitlist people to "past prospective" status, change their callsigns to LastFirstYY, and mark callsigns as unapproved.',
        controller: 'maintenance'
      },

      {
        action: 'reset-past-prospectives',
        title: 'Reset Past Prospectives',
        description: 'Reset people with status of "past prospective" AND who have approved callsigns to a callsign of LastFirstYY and mark callsign as unapproved',
        controller: 'maintenance'
      }
    ]
  },
  {
    group_title: 'Ticketing',
    tasks: [{
        action: 'grant-waps',
        title: 'Grant Ranger WAPs',
        description: "Grant Work Access Passes to any active or inactive Ranger who doesn't have one already",
        controller: 'access-document'
      },
      {
        action: 'grant-vps',
        title: 'Grant Vehicle Passes',
        description: "Grant Vehicle Passes to anyone with a current staff credential or reduced-price ticket (banked, qualified, or claimed) who doesn't have one already.",
        controller: 'access-document'
      },
      {
        action: 'grant-alpha-waps',
        title: 'Grant Alpha WAPs',
        description: "Grant Work Access Passes to alphas, plus to prospectives who have signed up for a yet-to-come training. Alpha WAPs created will be marked as claimed.",
        controller: 'access-document'
      },
      {
        action: 'set-staff-credentials-access-date',
        title: 'Set Staff Cred. Access Dates',
        description: 'Set the default access date on all qualified, claimed, or banked Staff Credentials with a missing access date.',
        controller: 'access-document'
      },
      {
        action: 'bump-expiration',
        title: 'Bump Expiration Date',
        description: 'Add 1 year to the expiration date on all banked and qualified tickets',
        controller: 'access-document',
        param: {
          title: 'Enter a reason why the ticket expiration dates are being bumped:',
          name: 'reason'
        }
      }
    ]
  },
  {
    group_title: 'Ticketing Post Event',
    tasks: [{
        action: 'clean-access-documents',
        title: 'Clean Access Docs From Prior Event',
        description: 'Mark all submitted Access Docs as used, and mark all non-bankable and unsubmitted Access Docs (Vehicle Passes, WAPs) as expired.',
        controller: 'access-document'
      },
      {
        action: 'bank-access-documents',
        title: 'Bank Access Docs From Prior Event',
        description: 'Mark all qualified tickets and credentials as banked (does not check for expiration)',
        controller: 'access-document'
      },
      {
        action: 'expire-access-documents',
        title: 'Expire Access Documents',
        description: 'Mark expired Access Docs as expired',
        controller: 'access-document'
      }
    ]
  },

  {
    group_title: 'BMID',
    tasks: [{
      action: 'set-bmid-titles',
      title: 'Set BMID Titles',
      description: 'Set BMID titles for Shift Leads, OODs, Operations Managers, Department Managers, LEALs, and 007s',
      controller: 'bmid'
    }]
  },
  {
    group_title: 'Clubhouse Messages',
    tasks: [{
      action: 'archive-messages',
      title: 'Archive and Reset Clubhouse Messages',
      description: 'Move all the previous year\'s Clubhouse messages into a (new) archive table.',
      controller: 'maintenance'
    }]
  }
];

export default class AdminMaintenanceController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked task = null;
  @tracked taskAction = null;
  @tracked results;
  @tracked taskParam = null;
  @tracked paramValue;

  taskGroups = TASK_GROUPS;

  @action
  executeTask(task) {
    this.taskParam = null;
    this.modal.confirm('Execute Task', `Are you sure you want to '${task.title}'?`, () => {
      const data = {};
      this.task = task;
      this.taskAction = task.action;
      this.isSubmitting = true;
      this.askParam = null;
      if (task.param) {
        data[task.param.name] = this.paramValue;
      }

      this.ajax.request(`${task.controller}/${task.action}`, { method: 'POST', data })
        .then((results) => this.results = results)
        .catch((response) => {
          this.house.handleErrorResponse(response);
          this.task = null;
        }).finally(() => this.isSubmitting = false);
    });
  }

  @action
  askParamAction(task) {
    this.paramValue = '';
    this.taskParam = task;
  }

  @action
  cancelParamAction() {
    this.taskParam = null;
  }

  @action
  showIndex() {
    this.task = null;
  }
}
