import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {cached} from '@glimmer/tracking';

export default class ReportsPeopleByRoleController extends ClubhouseController {
  @tracked showPerson = null;
  @tracked filter;
  @tracked roles;

  filterOptions = [
    {value: 'all', label: 'Any grant type'},
    {value: 'explicit', label: 'Exclusively granted roles'},
    {value: 'positions', label: 'Exclusively granted thru a team/position'}
  ];

  @cached
  get viewRoles() {
    switch (this.filter) {
      case 'explicit':
        return this.roles.map((role) => ({
          id: role.id,
          title: role.title,
          people: role.people.filter((person) => person.granted && !person.positions.length)
        }));
      case 'positions':
        return this.roles.map((role) => ({
          id: role.id,
          title: role.title,
          people: role.people.filter((person) => !person.granted && person.positions.length)
        }));
      default:
        return this.roles;
    }
  }

  @action
  showPersonAction(person) {
    this.showPerson = person;
  }

  @action
  closePerson() {
    this.showPerson = null;
  }

}
