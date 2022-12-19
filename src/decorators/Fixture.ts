import { decorateProperty, mergeDecorator } from '@plumier/reflect';
import { Faker } from '@faker-js/faker';

export type FixtureOptions =
  | string
  | number
  | symbol
  | boolean
  | Array<any>
  | ((faker: Faker, obj?: any) => any | undefined)
  | (() => any)
  | {
      type?: () => object;
      ignore?: boolean;
      enum?: object;
      min?: number;
      max?: number;
      computed?: boolean;
      get?: ((faker: Faker, obj?: any) => any) | (() => any);
    };

/**
 * Decorator for providing metadata about a property
 * or for customizing the generate fixture
 * @param options
 */
export function Fixture(options?: FixtureOptions) {
  return mergeDecorator(
    decorateProperty({
      type: 'Fixture',
      value: options,
    })
  );
}
