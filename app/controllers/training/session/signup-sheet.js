import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

// How many students shown per printed page
const STUDENTS_PER_PAGE = 18;
export default class TrainingSessionSignupSheetController extends Controller {
  @computed('students')
  get studentPages() {
    // Split the students into
    const pages = [];
    for (var i = 0; i < this.students.length; i+= STUDENTS_PER_PAGE){
      pages.push(this.students.slice(i,i+STUDENTS_PER_PAGE));
    }

    return pages;
  }
}
