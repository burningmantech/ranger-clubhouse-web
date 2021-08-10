import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import _ from 'lodash';
import dayjs from 'dayjs';

class PeriodOption {
  @tracked selected = false;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

export default class PeriodSelectComponent extends Component {
  @tracked showDialog = false;
  @tracked periodSelected = null;

  @cached
  get selectedLabel() {
    const {selected} = this.args;

    return selected ? dayjs(selected).format('YYYY ddd MMM D @ HH:mm') : 'No date time selected yet';
  }

  @cached
  get label() {
    return this.args.label ?? 'Select a period';
  }

  @cached
  get dayOptions() {
    const {periods, selected} = this.args;

    const dayGroups = _.groupBy(periods, (dt) => dayjs(dt.datetime).format('MMDD'));

    const options = [];

    for (const day in dayGroups) {
      const dts = dayGroups[day];
      options.push({
        label: dayjs(dts[0].datetime).format('ddd MMM Do YYYY'),
        periods: dts.map((period) => (new PeriodOption({
          period,
          label: dayjs(period.datetime).format('ddd MMM D @ HH:mm'),
          selected: (selected === period),
        })))
      })
    }

    const { allOption } = this.args;

    if (allOption) {
      options.unshift({
        label: allOption.groupLabel,
        periods: [
          new PeriodOption({
            period: allOption,
            label: allOption.optionLabel,
            selected: (allOption === selected)
          })
        ]
      })
    }

    return options;
  }

  @action
  openDialogAction() {
    this.showDialog = true;
  }

  @action
  cancelAction() {
    this.showDialog = false;
  }

  @action
  clickPeriodAction(period) {
    if (this.periodSelected) {
      this.periodSelected.selected = false;
    }

    this.periodSelected = period;
    this.periodSelected.selected = true;

    this.args.onSelect(period.period);
    this.showDialog = false;
  }
}
