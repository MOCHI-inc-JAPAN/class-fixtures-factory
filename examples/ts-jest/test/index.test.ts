import {
  FixtureFactory,
  Fixture,
} from '@mochi-inc-japan/class-fixtures-factory';

const factories = new FixtureFactory();

describe(`generating properties`, () => {
  it(`@Fixture(string)`, () => {
    class Person {
      @Fixture()
      lastName!: string;
    }
    factories.register([Person]);

    const person = factories.make(Person).one();
    expect(typeof person.lastName).toBe('string');
  });
});
