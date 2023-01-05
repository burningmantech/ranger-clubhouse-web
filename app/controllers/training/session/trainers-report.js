import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {set} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class TrainingSessionTrainersReportController extends ClubhouseController {
  @tracked vetCount;
  @tracked passed;
  @tracked firstYearCount;
  @tracked alphaCount;
  @tracked studentGroups;

  // Called from the route in setupController()
  computeStudentCounts() {
    let passed = 0, vetCount = 0, firstYearCount = 0, alphaCount = 0;
    let vetStudents = [], binaryStudents = [];

    this.students.forEach((student) => {
      if (!student.position_ids) {
        return;
      }
      set(student, 'teamTitles', student.team_short_titles.join(', '))

      // Count the students

      if (this.training.is_art) {
        if (student.is_art_prospective) {
          alphaCount++;
          binaryStudents.push(student);
        } else {
          vetCount++;
          vetStudents.push(student);
        }
      } else {
        if (student.years > 1) {
          vetCount++;
          vetStudents.push(student);
        } else {
          binaryStudents.push(student);

          if (student.years == 1) {
            firstYearCount++;
          } else {
            alphaCount++;
          }
        }
      }

      if (student.scored && student.passed) {
        passed++;
      }
    });

    // Sort the students
    vetStudents = this._sortByYearCallsign(vetStudents);
    binaryStudents = this._sortByYearCallsign(binaryStudents);

    this.vetCount = vetCount;
    this.passed = passed;
    this.firstYearCount = firstYearCount;
    this.alphaCount = alphaCount;

    this.studentGroups = [
      {
        groupName: 'Veterans',
        students: vetStudents
      },
      {
        groupName: (this.training.is_art ? 'ART Prospectives' : 'Binaries'),
        students: binaryStudents
      },
    ];
  }

  // Sort people by year, callsign
  _sortByYearCallsign(students) {
    return students.sort((a, b) => {
      if (a.years == b.years) {
        if (a.callsign > b.callsign) {
          return 1;
        } else if (a.callsign < b.callsign) {
          return -1
        } else {
          return 0;
        }
      } else {
        return b.years - a.years;
      }
    })
  }
}
