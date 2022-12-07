import { Faker } from '@faker-js/faker';
export type FixtureOptions = string | ((faker: Faker) => string | number | undefined) | (() => any) | {
    type?: () => object;
    ignore?: boolean;
    enum?: object;
    min?: number;
    max?: number;
    get?: ((faker: Faker) => string | number | undefined) | (() => any);
};
/**
 * Decorator for providing metadata about a property
 * or for customizing the generate fixture
 * @param options
 */
export declare function Fixture(options?: FixtureOptions): (...args: any[]) => void;
//# sourceMappingURL=Fixture.d.ts.map