import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { classNames } from '@ember-decorators/component';

// How many students shown per printed page
const STUDENTS_PER_PAGE = 18;

@classNames('signup-page', 'd-print-block', 'd-none')
export default class TrainingSignupSheetComponent extends Component {
  @argument students;
  @argument training;
  @argument slot;

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
