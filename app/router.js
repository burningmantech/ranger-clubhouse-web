import EmberRouter from '@ember/routing/router';
import config from 'clubhouse/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('offline');
  this.route('debug');

  this.route('login');
  this.route('reset-password');
  this.route('register');
  // this.route('sso'); -- uncomment if will SSO is ever implemented

  this.route('me', function () {
    this.route('homepage', {path: '/'});

    this.route('agreements', function() {
      this.route('index', { path: '/'});
      this.route('sign', { path: '/:tag'});
    });

    this.route('announcements');
    this.route('alerts');
    this.route('contact');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('help');
    this.route('mentees');
    this.route('messages');
    this.route('motorpool-policy');
    this.route('password');
    this.route('personal-info');
    this.route('radio-checkout');
    this.route('tickets');
    this.route('timesheet');
    this.route('survey');
    this.route('schedule', function () {
      this.route('index', {path: '/'});
    });
    this.route('timesheet-corrections', function () {
      this.route('review');
      this.route('missing');
      this.route('confirm');
    });
    this.route('trainer-feedback', function () {
      this.route('index', {path: '/'});
      this.route('view', {path: '/:year'});
    });
    this.route('vehicles');
    this.route('welcome');
  });

  this.route('search',  function () {
    this.route('assets');
    this.route('languages');
  });

  this.route('admin',  function () {
    this.route('action-log');
    this.route('alerts');
    this.route('assets');
    this.route('bulk-sign-in-out');
    this.route('bulk-signout');
    this.route('bulk-upload');
    this.route('clubhouse1-log');
    this.route('credits');
    this.route('error-log');
    this.route('event-dates');
    this.route('help');
    this.route('hours-credits');
    this.route('maintenance');
    this.route('motd');
    this.route('online-training', function () {
      this.route('index', {path: '/'});
      this.route('courses');
      this.route('enrollment');
    });
    this.route('people-by-status-change');
    this.route('positions');
    this.route('radio-eligibility');
    this.route('ranger-retention');
    this.route('rbs', function () {
      this.route('broadcast');
      this.route('broadcast-log');
      this.route('message-log');
      this.route('unknown-phones');
      this.route('stats');
      this.route('unverified-stopped');
    });
    this.route('roles');
    this.route('salesforce');
    this.route('settings');
    this.route('slots');
    this.route('survey', function () {
      this.route('index', {path: '/'});
      this.route('manage', {path: '/:survey_id'});
      this.route('preview', {path: '/:survey_id/preview'});
    });

    this.route('thank-you-cards');
    this.route('timesheet-sanity-checker');
    this.route('documents');
    this.route('bulk-lookup');
    this.route('bulk-positions');
  });

  this.route('hq', {path: '/hq/:person_id'}, function () {
    this.route('index', {path: '/'});
    this.route('assets');
    this.route('messages');
    this.route('schedule');
    this.route('shift');
    this.route('site-checkin');
    this.route('timesheet');
    this.route('training-info');
  });


  this.route('mentor',  function () {
    this.route('acceptance-sheets');
    this.route('alpha-status');
    this.route('assignment');
    this.route('convert');
    this.route('post-season-summary');
    this.route('potentials');
    this.route('schedule');
    this.route('alpha-signout');
  });


  this.route('person', {path: '/person/:person_id'}, function () {
    this.route('index', {path: '/'});
    this.route('access-documents');
    this.route('alerts');
    this.route('assets');
    this.route('bmid');
    this.route('broadcast-log');
    this.route('contact-log');
    this.route('dashboard');
    this.route('emergency-contact');
    this.route('event-info');
    this.route('mentors');
    this.route('messages');
    this.route('password');
    this.route('personal-info');
    this.route('schedule');
    this.route('tickets');
    this.route('timesheet-log');
    this.route('timesheet');
    this.route('photos');
    this.route('status-history');
    this.route('unified-flagging');
    this.route('external-ids');
    this.route('work-history');
  });

  this.route('logout');

  this.route('training', {path: '/training/:position_id'}, function () {
    this.route('index', {path: '/'});
    this.route('session', {path: '/session/:slot_id'}, function () {
      this.route('index', {path: '/'});
      this.route('signup-sheet');
      this.route('trainers-report');
    });
    this.route('capacity');
    this.route('multiple-enrollments');
    this.route('people-training-completed');
    this.route('untrained-people');
    this.route('trainer-attendance');
    this.route('survey', function () {
      this.route('report', {path: '/:survey_id'});
    });
  });

  this.route('reports',function () {
    this.route('alpha-shirts');
    this.route('asset-history');
    this.route('assets-outstanding');
    this.route('flakes');
    this.route('freaking-years');
    this.route('hq-forecast');
    this.route('languages');
    this.route('on-duty');
    this.route('people-by-location');
    this.route('people-by-position');
    this.route('people-by-role');
    this.route('people-by-status');
    this.route('position-sanity-checker');
    this.route('radio-assets');
    this.route('radio-checkout');
    this.route('rollcall');
    this.route('sandman-qualified');
    this.route('schedule-by-callsign');
    this.route('schedule-by-position');
    this.route('shift-coverage');
    this.route('shift-lead');
    this.route('shift-signups');
    this.route('potential-shirts');
    this.route('special-teams');
    this.route('timesheet-by-callsign');
    this.route('timesheet-by-position');
    this.route('timesheet-correction-requests');
    this.route('timesheet-totals');
    this.route('timesheet-unconfirmed');
    this.route('vehicle-paperwork');
    this.route('vehicle-registry');
  });

  this.route('vc', function () {
    this.route('access-documents', function () {
      this.route('index', {path: '/'});
      this.route('expiring');
      this.route('trs');
    });
    this.route('bmid');
    this.route('bmid-sanity-check');
    this.route('bmid-print');
    this.route('handle-checker');
    this.route('photo-review');
    this.route('unified-flagging');
    this.route('photos');
    this.route('spigot');
  });

  // Catch all for unrecognized urls
  this.route('not-found', {path: '/*path'});
});
