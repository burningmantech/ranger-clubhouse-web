import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {set} from '@ember/object';
import * as Position from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';

const TITLE_MAP = {
  [Position.CHEETAH]: 'Mnt',
  //[Position.ECHELON_FIELD]: 'Ech', Everyone gets to be Echelon Field
  [Position.ECHELON_FIELD_LEAD]: 'Ech',
  [Position.GREEN_DOT_LEAD]: 'GD',
  [Position.GREEN_DOT_LONG]: 'GD',
  //[Position.GREEN_DOT_MENTEE]: 'GD',  Not an actual Green Dot yet
  [Position.GREEN_DOT_MENTOR]: 'GD',
  [Position.DIRT_GREEN_DOT]: 'GD',
  [Position.SANCTUARY]: 'GD',
  // position does not exist
  //    [Position.GREEN_DOT_SHORT]: 'GD',
  //[Position.HOT_SPRINGS_PATROL]: 'HSP',  Roslyn thinks nobody cares
  //[Position.HQ_TRAINING]: 'HQ',  Everyone gets to be HQ training
  [Position.HQ_LEAD]: 'HQ',
  [Position.HQ_TRAINING_REFRESHER]: 'HQ',
  //[Position.HQ_RUNNER]: 'HQ',	Everybody gets to be HQ runner
  [Position.HQ_SHORT]: 'HQ',
  [Position.HQ_SUPERVISOR]: 'HQ',
  [Position.HQ_TRAINER]: 'HQ',
  [Position.HQ_WINDOW]: 'HQ',
  //[Position.INTERCEPT]: 'Int',	Everybody gets to be Intercept
  [Position.INTERCEPT_DISPATCH]: 'Int',
  [Position.INTERCEPT_OPERATOR]: 'Int',
  [Position.LEAL]: 'LEAL',
  [Position.LEAL_MENTEE]: 'LEAL',
  [Position.LOGISTICS]: 'Log',
  [Position.MENTOR]: 'Mnt',
  [Position.MENTOR_LEAD]: 'Mnt',
  [Position.MENTOR_SHORT]: 'Mnt',
  [Position.OOD]: 'OOD',
  [Position.OPERATIONS_MANAGER]: 'OpsMgr',
  [Position.OPERATOR]: 'Op',
  //[Position.ORANGE_DOT]: 'OD', -- Roslyn thinks this is controversial
  [Position.PERSONNEL_MANAGER]: 'PM',
  [Position.RNR]: 'RNR',
  //[Position.RSC_ENVOY]: 'Env',
  [Position.RSCI]: 'RSCI',
  [Position.SANDMAN]: 'Snd',
  [Position.RSC_SHIFT_LEAD]: 'SL',
  [Position.RSC_WESL]: 'WESL',
  [Position.SITE_SETUP]: 'SITE',
  //[Position.SITE_TEARDOWN]: 'SITE',  Everybody gets to be SITE TD
  [Position.TECH_TEAM]: 'Tech',
  [Position.TOW_TRUCK_DRIVER]: 'Tow',
  [Position.TRAINER]: 'Trg'
};

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
      const studentPositions = {};

      if (!student.position_ids) {
        return;
      }

      // Figure out what teams the person belongs to, if any.
      student.position_ids.forEach((id) => {
        if (TITLE_MAP[id]) {
          studentPositions[TITLE_MAP[id]] = 1;
        }
      })

      const teams = Object.keys(studentPositions);
      if (teams.length > 0) {
        set(student, 'teamTitles', teams.join(', '));
      }

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
