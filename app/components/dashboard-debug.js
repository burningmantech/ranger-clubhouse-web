import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import {action, set} from '@ember/object';
import * as Position from 'clubhouse/constants/positions';
import dayjs from 'dayjs';

export default class DashboardDebugComponent extends Component {
  @tracked show = false;

  boolOpts = [
    ["false", false],
    ["true", true],
  ];

  periodOpts = [
    ['Before Event', 'before-event'],
    ['Event', 'event'],
    ['After Event', 'after-event'],
  ];

  photoOpts = [
    'missing',
    'submitted',
    'approved',
    'rejected'
  ];

  ticketingPeriodOpts = [
    'offseason',
    'announce',
    'open',
    'closed'
  ];

  ticketPackages = {
    claimed: {
      tickets: [
        { type: 'special_price_ticket', status: 'claimed' }
      ],
      vehicle_pass: { type: 'vehicle_pass', status: 'claimed' },
      wap: { type: 'work_access_pass', status: 'claimed' },
      wapso: [
        { type: 'work_access_pass_so', status: 'claimed', name: 'Hubcap SO #1' },
        { type: 'work_access_pass_so', status: 'claimed', name: 'Hubcap SO #2' },
      ]
    },
    banked: {
      tickets: [
        { type: 'special_price_ticket', status: 'banked', expiry_date: '2024-09-15' }
      ],
      vehicle_pass: { type: 'vehicle_pass', status: 'qualified' },
      wap: { type: 'work_access_pass', status: 'qualified' },
      wapso: [ ]
    },

    qualified: {
      tickets: [
        { type: 'special_price_ticket', status: 'qualified' }
      ],
      vehicle_pass: { type: 'vehicle_pass', status: 'qualified' },
      wap: { type: 'work_access_pass', status: 'qualified' },
      wapso: [
      ]
    },
  }

  @action
  updatePhotoStatus(value) {
    const { photo } = this.args;

    if (value === 'rejected') {
      photo.rejections = [ 'The photo is too bright. Try turning down the lighting in the room, or move out of direct sunlight.'];
      photo.reject_message = 'Hubcap, overall your photo is great, however, please fix the lighting.';
    }

    set(photo, 'photo_status', value);
    this.args.update();
  }

  @action
  setSurveys() {
    this.args.milestones.surveys.sessions = [
      {id: 9999, position_title: 'Training', description: 'Lorem Ipsum', begins: this._getDate('05-31')}
    ];

    this.args.update();
  }

  @action
  clearSurveys() {
    this.args.milestones.surveys.sessions = [];
    this.args.update();
  }

  @action
  setTrainerSurveys() {
    this.args.milestones.surveys.trainers = [
      {
        id: 99,
        description: 'Lorem Ipsum Trainerus',
        begins: this._getDate('05-31'),
        position_id: 99,
        position_title: 'Trainer',
        trainers: [
          {id: 1, callsign: 'Hubcap', position_title: 'Trainer'}
        ]
      }];
    this.args.update();
  }

  @action
  clearTrainerSurveys() {
    this.args.milestones.surveys.trainers = [];
    this.args.update();
  }

  @action
  setIsTrainer(name, value) {
    if (this.args.milestones.training) {
      this.args.milestones.training.is_trainer = value;
    }
  }

  @action
  setTraining(status) {
    this.args.milestones.training = {
      status,
      slot_id: 1234,
      location: 'Lorem Ipsum Training',
      is_trainer: this.args.milestones.is_trainer,
      date: this._getDate('05-31')
    };

    this.args.update();
  }

  @action
  setFullDay(full) {
    this.args.milestones.needs_full_training = full;
    this.args.update();
  }

  @action
  setCheetahCub(name,value) {
    this.args.milestones.needs_full_training = value;
  }

  @action
  setCheetahCubShift(signup) {
    if (signup) {
      this.args.milestones.cheetah_cub_shift = {
        slot_id: 999,
        begins:this._getDate('08-27'),
        status: 'pending'
      };
    } else {
      delete this.args.milestones.cheetah_cub_shift;
    }
    this.args.update();
  }

  @action
  updateTicketingPeriod(name, value) {
    const milestones = this.args.milestones;
    if ((value === 'open' || value === 'closed') && !milestones.ticketing_package) {
      milestones.ticketing_package = this.ticketPackages.qualified;
      // select update will bubble up to @onFormChange
    }
  }

  @action
  setTicketPackage(pkg) {
    this.args.milestones.ticketing_package = this.ticketPackages[pkg];
    this.args.update();
  }

  @action
  setUnverifiedTS(count) {
    this.args.milestones.timesheets_unverified = +count;
    this.args.update();
  }

  @action
  setShiftSignups(count) {
    this.args.milestones.shift_signups = +count;
    this.args.update();
  }

  @action
  setVehicleRequests(req) {
    this.args.milestones.vehicle_requests = (req === 'missing' ? [] : [ { status: req }]);
    this.args.update();
  }

  @action
  updateVehicleRequests(name, value) {
    const { milestones } = this.args;
    if (value && !milestones.vehicle_requests) {
      milestones.vehicle_requests = [];
    }
  }

  @action
  toggleShow() {
    this.show = !this.show;
  }

  _getDate(monthDay) {
    return dayjs().format(`YYYY-${monthDay} 09:00:00`)
  }

  @action
  setARTs(status) {
    const { milestones } = this.args;

    switch (status) {
      case 'none':
        milestones.art_trainings = [];
        break;
      case 'no-shift':
        milestones.art_trainings = [
          { status, position_id: Position.GREEN_DOT_TRAINING, position_title: 'Green Dot Training'},
          { status, position_id: Position.SANDMAN_TRAINING, position_title: 'Sandman Training'},
        ];
        break;
      case 'pass':
      case 'fail':
      case 'pending':
        milestones.art_trainings = [
          { status, position_id: Position.GREEN_DOT_TRAINING, position_title: 'Green Dot Training', date: '2020-06-01 09:30:00', location: "Hubcap's House" },
          { status, position_id: Position.SANDMAN_TRAINING, position_title: 'Sandman Training', date: '2020-08-30 08:00:00', location: 'DPW Depot'}
        ];
        break;
    }

    this.args.update();
  }
}
