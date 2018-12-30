export default function(server) {
  server.loadFixtures('people');
  server.loadFixtures('positions');
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  // server.createList('post', 10);
}
