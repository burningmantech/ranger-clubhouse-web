import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  didTransition() {
    this._super(...arguments);
    if (!this.get('fastboot.isFastBoot')) {
      window.scrollTo(0,0);
    }
  }
});

Router.map(function() {
  this.route('login');
  this.route('offline');
  this.route('reset-password');
  this.route('me', function() {
    this.route('overview');
    this.route('ranger-info');
    this.route('personal-info');
    this.route('emergency-contact');
    this.route('password');
    this.route('messages');
    this.route('timesheet', function() {
      this.route('review', { path: '/' });
      this.route('missing');
      this.route('confirm');
    });
    this.route('schedule', function() {
      this.route('index',  { path: '/' });
      this.route('print');
    });
    this.route('tickets');
    this.route('help');
    this.route('motorpool-policy');
    this.route('alerts');
    this.route('mentees');
    this.route('contact');
  });

  this.route('search', function() {
    this.route('person');
    this.route('assets');
    this.route('languages');
  });
  this.route('admin', function() {
    this.route('positions');
    this.route('slots');
    this.route('credits');
    this.route('roles');
  });
  this.route('handle-checker');

  this.route('person', { path: '/person/:person_id' } ,function() {
    this.route('index', { path: '/' });
    this.route('assets');
    this.route('password');
    this.route('event-info');
    this.route('personal-info');
    this.route('emergency-contact');
    this.route('timesheet');
    this.route('messages');
    this.route('mentors');
    this.route('schedule');
    this.route('timesheet-log');
    this.route('contact-log');
    this.route('broadcast-log');
  });
  this.route('logout');
  this.route('training', { path: '/training/:position_id' }, function() {
    this.route('index', { path: '/'});
    this.route('session', { path: '/session/:slot_id'}, function() {
      this.route('index', { path: '/' });
      this.route('signup-sheet');
      this.route('trainers-report');
    });
    this.route('capacity');
    this.route('multiple-enrollments');
    this.route('people-training-completed');
    this.route('untrained-people');
  });
  this.route('debug');
  this.route('reports', function() {
    this.route('timesheet-correction-requests');
    this.route('timesheet-unconfirmed');
  });
});

export default Router;
