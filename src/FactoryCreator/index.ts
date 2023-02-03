/* eslint-disable no-dupe-class-members */
import { FixtureFactory, FactoryOptions } from '../FixtureFactory';
import { Class } from '../common/typings';

export interface IFixtureFactory<T> {
  create(params?: Partial<T>): T;
  create(params: Partial<T>, count?: number): T[];
  createMany(...params: Partial<T>[]): T[];
}

export const FactoryCreator = <CType extends Class<any>>(
  ClassType: CType,
  options?: FactoryOptions
) => {
  const factories = new FixtureFactory(options);
  type Instance = InstanceType<CType>;
  factories.register([ClassType]);
  class ModelFactoryClass implements IFixtureFactory<CType> {
    create(params?: Partial<Instance>): Instance;
    create(params: Partial<Instance>, count: number): Instance[];

    create(params?: Partial<Instance>, count?: number): Instance | Instance[] {
      const _params = params || {};
      if (typeof count === 'undefined')
        return factories
          .make(ClassType)
          .with({ ..._params })
          .one() as Instance;
      return factories
        .make(ClassType)
        .with({ ..._params })
        .many(count) as Instance[];
    }

    createMany(...params: Partial<Instance>[]): Instance[] {
      return params.map((param) => {
        const maker = factories.make(ClassType);
        return maker.with(param).one();
      });
    }
  }
  return ModelFactoryClass;
};
