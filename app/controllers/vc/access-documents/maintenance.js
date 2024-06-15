import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import GrantWAPs from 'clubhouse/components/vc-maintenance/grant-waps';
import GrantVPs from 'clubhouse/components/vc-maintenance/grant-vps';
import UnbankAccessDocuments from 'clubhouse/components/vc-maintenance/unbank-access-documents';
import UnbankProvisions from 'clubhouse/components/vc-maintenance/unbank-provisions';
import SetSCAccessDates from 'clubhouse/components/vc-maintenance/set-sc-access-dates';
import CleanAccessDocuments from 'clubhouse/components/vc-maintenance/clean-access-documents';
import CleanProvisions from 'clubhouse/components/vc-maintenance/clean-provisions';
import ExpireAccessDocuments from 'clubhouse/components/vc-maintenance/expire-access-documents';
import ExpireProvisions from 'clubhouse/components/vc-maintenance/expire-provisions';
import BumpExpiration from 'clubhouse/components/vc-maintenance/bump-expiration';

const TASK_GROUPS = [
  {
    group_title: 'Tickets and Provision Functions Prior To Ticketing Window Opening',
    tasks: [
      {
        action: 'unbank-access-documents',
        title: 'Unbank Tickets',
        description: 'Take all banked tickets and update the status to qualified (unbank). Do this before ticketing is opened.',
        controller: 'access-document',
        component: UnbankAccessDocuments,
      },
      {
        action: 'unbank-provisions',
        title: 'Unbank Provisions',
        description: 'Take all banked provisions and update the status to available (un-bank). Do this before ticketing is opened.',
        controller: 'provision',
        component: UnbankProvisions,
      },
      {
        action: 'grant-waps',
        title: 'Grant Ranger SAPs',
        description: "Grant Setup Access Passes to any active or inactive Ranger who doesn't have one already and who has worked in the last 3 official event years (2020 and 2021 are skipped over.)",
        controller: 'access-document',
        component: GrantWAPs
      },
      {
        action: 'grant-vps',
        title: 'Grant Vehicle Passes',
        description: "Grant Gift VPs to current Staff Credential holders and Special Price VPs to Special Price Ticket holders who doesn't have one already. People with a SC and SPT will receive both VP types.",
        controller: 'access-document',
        component: GrantVPs,
      },
      {
        action: 'set-staff-credentials-access-date',
        title: 'Set Staff Cred. Access Dates',
        description: 'Set the default access date on all qualified, claimed, or banked Staff Credentials with a missing access date.',
        controller: 'access-document',
        component: SetSCAccessDates,
      },
    ]
  },
  {
    group_title: 'Ticketing Pre-Event',
    tasks: [
      {
        action: 'grant-alpha-waps',
        title: 'Grant Alpha SAPs',
        description: "Grant Setup Access Passes to alphas, plus to prospectives who have signed up for a yet-to-come training. Alpha SAPs created will be marked as claimed.",
        controller: 'access-document',
        component: GrantWAPs,
      },
    ]
  },
  {
    group_title: 'Ticketing and Provisions Post-Event',
    tasks: [
      {
        action: 'clean-access-documents',
        title: 'Clean Access Docs From Prior Event',
        description: 'Mark all submitted Access Docs as used, and mark all non-bankable and un-submitted Access Docs (Vehicle Passes, SAPs) as expired.',
        controller: 'access-document',
        component: CleanAccessDocuments,
      },
      {
        action: 'bank-access-documents',
        title: 'Bank Access Docs From Prior Event',
        description: 'Mark all qualified tickets and credentials as banked (does not check for expiration)',
        controller: 'access-document',
        component: CleanAccessDocuments
      },
      {
        action: 'expire-access-documents',
        title: 'Expire Access Documents',
        description: 'Mark expired Access Docs as expired',
        controller: 'access-document',
        component: ExpireAccessDocuments,
      },
      {
        route: 'vc.access-documents.unsubmit-provisions',
        title: 'Un-Submit Provisions',
        description: 'Recommends provisions marked as submitted to be "un-submit" (aka update to available) for people who did not work. Targeted at individuals who had both allocated and earned provisions.',
      },
      {
        action: 'clean-provisions',
        title: 'Clean Provisions From Prior Event',
        description: 'Mark all submitted provisions as used, and mark allocated provisions either expired (unused) or used (claimed/submitted). Any earned event radios not banked and not consumed will be expired. Run BEFORE Bank Provisions.',
        controller: 'provision',
        component: CleanProvisions,
      },
      {
        action: 'bank-provisions',
        title: 'Bank Provisions From Prior Event',
        description: 'Mark all qualified provisions (does not check for expiration). Only run AFTER Clean Provisions so event radios are properly handled.',
        controller: 'provision',
        component: CleanProvisions,
      },
      {
        action: 'expire-provisions',
        title: 'Expire Provisions',
        description: 'Mark expired Provisions as expired',
        controller: 'provision',
        component: ExpireProvisions,
      }
    ]
  },
  {
    group_title: 'Misc. Maintenance Functions',
    tasks: [
      {
        action: 'bump-expiration',
        title: 'Bump Expiration Date',
        description: 'Add 1 year to the expiration date on all banked and qualified tickets',
        controller: 'access-document',
        component: BumpExpiration,
        param: {
          title: 'Enter a reason why the ticket expiration dates are being bumped:',
          name: 'reason'
        }
      },
    ]
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

      this.ajax.request(`${task.controller}/${task.action}`, {method: 'POST', data})
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
