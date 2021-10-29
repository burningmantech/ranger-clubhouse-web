import Response from 'ember-cli-mirage/response';
import dayjs from 'dayjs';
import configMock from './api-mocks/config-mock';
import scheduleMock from './api-mocks/schedule-mock';

export default function () {
  this.urlPrefix = 'http://localhost:8000';

  configMock(this);
  scheduleMock(this);

  this.post('/api/auth/login', function (schema, request) {
    let params = JSON.parse(request.requestBody);
    let person;

    if (params.temp_token) {
      person = schema.db.people.findBy({tpassword: params.temp_token});
    } else {
      if (!params.identification || !params.password) {
        const errors = [];

        if (!params.identification) {
          errors.push({status: 422, title: 'Email cannot be blank'});
        }

        if (!params.password) {
          errors.push({status: 422, title: 'Password cannot be blank'});
        }

        return new Response(422, {'Content-Type': 'application/json'}, {errors});
      }

      person = schema.db.people.findBy({email: params.identification});
    }

    if (!person) {
      return new Response(401, {'Content-Type': 'application/json'}, {status: 'invalid-credentials'});
    }

    if (person.status === 'suspended') {
      return new Response(401, {'Content-Type': 'application/json'}, {status: 'account-disabled'})
    }

    const payload = {
      exp: (Math.ceil(Date.now() / 1000) + 1000),
      sub: person.id,
    };


    return {
      // ember-simple-auth only cares about the middle value
      token: `${btoa('header')}.${btoa(JSON.stringify(payload))}.${btoa('signature')}`,
      token_type: 'bearer',
      expires_in: 1000,
    };
  });

  this.get('/api/person/:id', ({people}, request) => { // eslint-disable-line no-unused-vars
    const person = people.find(request.params.id);

    if (!person) {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }

    return person;
    //return this.serializerOrRegistry.serialize(person, 'person');
  });

  this.put('/api/person/:id', ({people}, request) => {
    const body = JSON.parse(request.requestBody);
    const person = people.find(request.params.id);

    if (!person) {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }

    person.update(body.person);

    return person;
  });

  this.get('/api/person/:id/user-info', ({people}, request) => { // eslint-disable-line no-unused-vars
      const person = people.find(request.params.id);
      if (!person) {
        return new Response(404, {'Content-Type': 'application/json'}, {
          errors: [{status: 404, title: 'Record does not exist.'}]
        });
      }

      return {
        user_info: {
          id: person.id,
          callsign: person.callsign,
          callsign_approved: true,
          status: person.status,
          unread_message_count: 2,
          years: [2017, 2018],
          all_years: [2017, 2018],
          rangered_years: [2018],
          non_ranger_years: [2020],
          roles: person.roles,
          teacher: {
            is_trainer: false,
            is_art_trainer: false,
            is_mentor: false,
            have_mentored: false
          }
        }
      }
    }
  )


  this.get('/api/person/:id/years', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {
      years: [2017, 2018],
      all_years: [2017, 2018],
      rangered_years: [2018],
      non_ranger_years: [2020],
    };
  });

  this.get('/api/person/:id/unread-message-count', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {unread_message_count: 2};
  });

  this.get('/api/person/:id/teacher', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {
      is_trainer: false,
      is_art_trainer: false,
      is_mentor: false,
      have_mentored: false
    };
  });

  this.get('/api/person/:id/photo', ({people}, request) => { // eslint-disable-line no-unused-vars
    return {
      photo: {
        photo_status: 'approved',
        photo_url: 'http://127.0.0.1/test.jpg',
        upload_enabled: true
      }
    };
  });


  this.get('/api/person/:id/event-info', ({people}, request) => {
    const person = people.find(request.params.id); // eslint-disable-line no-unused-vars

    return {
      event_info: {
        year: (new Date()).getFullYear(),
        trainings: [{
          position_title: 'Training',
          position_id: 13,
          location: 'Trainlandia',
          date: dayjs().format('YYYY-MM-DD hh:mm:ss'),
          status: 'pass'
        }],
        radio_eligible: 1,
        radio_max: 1,
        meals: '',
        showers: '',
        radio_info_available: false,
      }
    };
  });

  this.get('/api/person/:id/credits', ({people}, request) => {
    const person = people.find(request.params.id);

    return {credits: person.credits || 0};
  });

  this.get('/api/person/:id/schedule/summary', ({people}, request) => {
    const person = people.find(request.params.id); // eslint-disable-line no-unused-vars

    return {summary: {}};
  });

  this.get('/api/person/:id/positions', ({positions}) => {
    return positions.all();
  });

  this.get('/api/position', ({positions}) => {
    return positions.all();
  });

  this.get('/api/motd/bulletin', () => {
    return {
      motd: [], meta: {
        total: 0, page: 1, page_size: 100
      }
    };
  });

  this.get('/api/person/:id/milestones', () => {
    return {
      milestones: {
        training: {status: 'pass'},
        alpha_shift: {status: 'pass'},
        online_training_passed: true,
        behavioral_agreement: true,
        has_reviewed_pi: true,
        photo_upload_enabled: true,
        art_trainings: [],
        shift_signups: {
          total_duration: 0,
          counted_duration: 0,
          credits: 0.0,
          slot_count: 0
        },
        surveys: {
          sessions: [],
          trainers: []
        }
      }
    };
  });

  this.get('/api/person-event/:id', () => {
    return {
      person_event: {
        id: '1-2020',
        may_request_stickers: 1,
        org_vehicle_insurance: 1,
        signed_motorpool_agreement: 1,
        signed_personal_vehicle_agreement: 1,
        asset_authorized: 1,
        timesheet_confirmed_at: 1,
        timesheet_confirmed: 1,
        sandman_affidavit: 1
      }
    };
  });

  this.get('/api/vehicle/:id', () => {
    return {
      vehicle: {
        id: 1,
        vehicle_make: 'ford',
        vehicle_model: 'f-350',
        vehicle_color: 'khaki',
        vehicle_year: 2019,
        person_id: 1,
        person: {callsign: 'hubcap'},
      }
    };
  });

  this.get('/api/document/:id', (_, request) => {
    const id = request.params.id;
    if (id === 'tag-test') {
      return {
        document: {
          id: 1,
          tag: 'tag-test',
          description: 'a description',
          body: 'a body',
          person_create_id: 1,
          person_update_id: 1,
        }
      };
    } else {
      return new Response(404, {'Content-Type': 'application/json'}, {
        errors: [{status: 404, title: 'Record does not exist.'}]
      });
    }
  });

  this.get('/api/agreements/:id', () => {
    return { agreements: [] };
  });

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */
}
