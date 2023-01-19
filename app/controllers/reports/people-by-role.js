import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {cached} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'ID', key: 'id'},
  {title: 'Callsign', key: 'callsign'},
  {title: 'Explicit Grant?', key: 'granted', yesno: true},
  {title: 'Teams', key: 'teams'},
  {title: 'Positions', key: 'positions'}
];

export default class ReportsPeopleByRoleController extends ClubhouseController {
  @tracked showPerson = null;
  @tracked filter;
  @tracked roles;

  filterOptions = [
    {value: 'all', label: 'Any assignment type'},
    {value: 'explicit', label: 'Exclusively assigned roles'},
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
        id: p.id,
        callsign: p.callsign,
        granted: p.granted,
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

    this.house.downloadCsv(`${this.house.currentYear()}-${role.title}-grants.csv`, CSV_COLUMNS, rows);
  }

  grantedHow(person) {
    const grants = [];

    if (person.notAssigned) {
      return 'untrained position';
    }

    if (person.granted) {
      grants.push('role');
    }

    if (person.positions.length) {
      grants.push('position');
    }

    if (person.teams.length) {
      grants.push('team');
    }

    return grants.join(', ');
  }
}
