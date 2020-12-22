import Controller from '@ember/controller';

export default class TrainingCapacityController extends Controller {
  queryParams = [ 'year' ];

  get notCurrentYear() {
    return (this.year != this.house.currentYear());
  }

  get totalFullPercentage() {
    const slots = this.slots;
    const signups = slots.reduce((total, slot) => slot.signed_up + total, 0);
    const seats = slots.reduce((total, slot) => slot.max + total, 0);

    return Math.round((signups  / seats) * 100);
  }
}
