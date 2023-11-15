import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const TASK_GROUPS = [
  {
    group_title: 'Account Post-Event',
    tasks: [{
      action: 'mark-off-site',
      title: 'Mark all Rangers as off-site',
      description: 'Any Ranger who was marked as on site will be marked as off site',
      controller: 'maintenance'
    }],
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
