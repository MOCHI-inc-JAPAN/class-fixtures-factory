import { FixtureFactory } from '../../src/FixtureFactory';
import { Fixture } from '../../src/decorators/Fixture';
import { Faker } from '@faker-js/faker';

describe('faker injected', () => {
  it('faker with @Fixture((faker)=>faker)', () => {
    let factory = new FixtureFactory({ maxReflectionCallDepth: 1 });

    class Count {
      @Fixture((faker) => faker as any)
      count!: number;
    }

    class CountGet {
      @Fixture({ get: (faker) => faker as any })
      count!: number;
    }
    factory.register([Count, CountGet]);
    const counter = factory.make(Count).one();
    const counterGet = factory.make(CountGet).one();
    expect(counter.count === counterGet.count).toBeTruthy();
    expect((counter.count as any as Faker).random.word()).toBeTruthy();
  });
});
