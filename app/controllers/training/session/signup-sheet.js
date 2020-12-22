import Controller from '@ember/controller';
import _ from 'lodash';

// How many students shown per printed page
const STUDENTS_PER_PAGE = 11;

export default class TrainingSessionSignupSheetController extends Controller {
  get studentPages() {
    return _.chunk(this.students, STUDENTS_PER_PAGE);
  }
}
