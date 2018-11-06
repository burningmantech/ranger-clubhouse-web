import Response from 'ember-cli-mirage/response';
import JWT from 'jsonwebtoken';

export default function() {
  // imported from ember-cli-simple-auth-token

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  this.urlPrefix = 'http://localhost:8000';

  this.get('/api/config', function()  {
    return { };
  });

  this.post('/api/auth/login', function(schema, request) {
    let params = JSON.parse(request.requestBody);

    if (!params.identification || !params.password) {
      const errors = [];

      if (!params.identification) {
        errors.push({ status: 422, title: 'Email cannot be blank'});
      }

      if (!params.password) {
        errors.push({ status: 422, title: 'Password cannot be blank'});
      }

      console.log("/api/configs Returning errors ");
      return new Response(422, {'Content-Type': 'application/json'}, { errors });
    }

    const person = schema.db.people.findBy({ email: params.identification });
    if (!person) {
      return new Response(401, { 'Content-Type': 'application/json' }, {
        errors: [ { status: 401, title: 'The email and/or password is incorrect. '}]
      } );
    }

    let token = JWT.sign({person_id: person.id}, 'secret', { expiresIn: 1000 });
    let data =  {
      token,
      token_type: 'bearer',
      expires_in: 1000,
      person_id:  person.id,
   };

    return data;
  });

  this.get('/api/person/:id', ({people}, request) => {
    const person = people.find(request.params.id);

    if (!person) {
      return new Response(404, { 'Content-Type': 'application/json' }, {
        errors: [ { status: 404, title: 'Record does not exist.'}]
      } );
    }

    return person;
    //return this.serializerOrRegistry.serialize(person, 'person');
  });

  this.get('/api/position', ({positions}) => {
    return positions.all();
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
