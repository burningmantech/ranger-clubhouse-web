import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import ResetApplicants from "clubhouse/components/vc-maintenance/reset-applicants";
import ResetPastProspectives from "clubhouse/components/vc-maintenance/reset-past-prospectives";
import SetBMIDTitles from "clubhouse/components/vc-maintenance/set-bmid-titles";

export default class VcMaintenanceController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked task = null;
  @tracked taskAction = null;
  @tracked results;

  tasks = [
    {
      action: 'reset-pnvs',
      title: 'Reset Applicants To Past Prospective',
      description: 'Revert Alpha/Bonked/Prospectives to "past prospective" status, change their callsigns to LastFirstYY, and mark the callsign as unapproved.',
      controller: 'maintenance',
      component: ResetApplicants,
    },
    {
      action: 'reset-past-prospectives',
      title: 'Reset Past Prospectives',
      description: 'Reset past prospective account who have approved callsigns to a callsign of LastFirstYY and mark callsign as unapproved',
      controller: 'maintenance',
      component: ResetPastProspectives,
    },
    {
      action: 'set-bmid-titles',
      title: 'Set BMID Titles',
      description: 'Set BMID titles for Shift Leads, OODs, Operations Managers, Department Managers, LEALs, and 007s',
      controller: 'bmid',
      component: SetBMIDTitles,
      roleRequired: "edit-bmids",
    }
  ];

  @action
  executeTask(task) {
    this.modal.confirm('Execute Task', `Are you sure you want to '${task.title}'?`,
      async () => {
        this.task = task;
        this.taskAction = task.action;
        try {
          this.isSubmitting = true;
          this.results = await this.ajax.request(`${task.controller}/${task.action}`, {method: 'POST'});
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  showIndex() {
    this.task = null;
  }
}
