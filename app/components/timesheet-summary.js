import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class TimesheetSummaryComponent extends Component {
    @argument('object') summary;
}
