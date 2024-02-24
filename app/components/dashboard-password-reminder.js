import Component from '@glimmer/component';

export default class DashboardPasswordReminderComponent extends Component {
  get showReminder() {
    // Show the reminder in August.
    return (new Date()).getMonth() === 7;
  }
}
