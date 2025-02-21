import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {cached} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Active?', key: 'active', yesno: true },
  {title: 'Manual Assignment?', key: 'granted', yesno: true},
  {title: 'Thru Teams', key: 'teams'},
  {title: 'Thru Positions', key: 'positions'}
];

export default class AdminPeopleByPermissionController extends ClubhouseController {
  @tracked showPerson = null;
  @tracked filter;
  @tracked roles;

  filterOptions = [
    {value: 'all', label: 'Any assignment type'},
    {value: 'explicit', label: 'Manually assigned roles'},
    {value: 'positions', label: 'Only assigned thru a team/position'},
    {value: 'not-trained', label: 'Only assigned thru a position yet is untrained'}
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

      case 'not-trained':
        return this.roles.map((role) => ({
          id: role.id,
          title: role.title,
          people: role.people.filter((person) => person.notAssigned)
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

  @action
  exportToCSV(role) {
    const rows = role.people.map((p) => {
      return {
        callsign: p.callsign,
        status: p.status,
        granted: p.granted,
        active: p.active,
        teams: p.teams.map((t) => t.title).join("\n"),
        positions: p.positions.map((p) => p.title).join("\n"),
        positions_granted: p.positions.map((p) => {
          if (!p.require_training_for_roles) {
            return 'Granted - Training not required';
          } else if (p.is_trained) {
            return 'Granted - Training passed';
          } else {
            return 'NOT GRANTED - Training not passed';
          }
        }).join("\n")
      }
    })

    this.house.downloadCsv(`${this.house.currentYear()}-role-${role.title.replace(/(\s+|\(|\)|-)+/g,'-')}-report.csv`, CSV_COLUMNS, rows);
  }
}
