import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class TrainingSessionTrainersReportController extends ClubhouseController {
  @tracked studentGroups;

  // Called from the route in setupController()
  computeStudentCounts() {
    let vetStudents = [], binaryStudents = [];

    this.students.forEach((student) => {
      if (!student.team_short_titles) {
        return;
      }
      set(student, 'teamTitles', student.team_short_titles.join(', '))

      // Group the students

      if (this.training.is_art) {
        if (student.is_art_prospective) {
          binaryStudents.push(student);
        } else {
          vetStudents.push(student);
        }
      } else {
        if (student.years > 1) {
          vetStudents.push(student);
        } else {
          binaryStudents.push(student);
        }
      }
    });

    this.studentGroups = [
      {
        groupName: 'Veterans',
        students: this._sortByYearCallsign(vetStudents)
      },
      {
        groupName: (this.training.is_art ? 'ART Prospectives' : 'Binaries'),
        students: this._sortByYearCallsign(binaryStudents)
      },
    ];
  }

  // Sort people by year, callsign
  _sortByYearCallsign(students) {
    return students.sort((a, b) => {
      if (a.years == b.years) {
        return (a.callsign ?? '').localeCompare(b.callsign ?? '');
      } else {
        return b.years - a.years;
      }
    })
  }
}
