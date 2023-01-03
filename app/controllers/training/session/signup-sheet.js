import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import _ from 'lodash';

// How many students shown per printed page
const STUDENTS_PER_PAGE = 11;

export default class TrainingSessionSignupSheetController extends ClubhouseController {
  get studentPages() {
    return _.chunk(this.students, STUDENTS_PER_PAGE);
  }

  get totalPages() {
    // Dirt trainings are not allowed walk-ins, hence no walk-in sign-up sheet.
    return (this.training.is_art ? 1 : 0) + this.studentPages.length;
  }
}
