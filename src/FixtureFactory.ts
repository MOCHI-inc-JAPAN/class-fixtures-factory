import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import { Class } from './common/typings';
import { FactoryLogger } from './FactoryLogger';
import {
  BaseMetadataStore,
  ClassMetadata,
  DefaultMetadataStore,
  PropertyMetadata,
} from './metadata';

export interface FactoryOptions {
  logging?: boolean;
  maxReflectionCallDepth?: number;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export interface FactoryResult<T> {
  maxReflectionCallDepth: number;
  one: () => T;
  many: (x: number) => T[];
  with: (input: DeepPartial<T>) => FactoryResult<T>;
  ignore: (...props: (keyof T)[]) => FactoryResult<T>;
}

export type Assigner = (
  prop: PropertyMetadata,
  object: any,
  value: any
) => void;

export class FixtureFactory {
  private classTypes: Record<string, Class> = {};
  private DEFAULT_OPTIONS: Required<FactoryOptions> = {
    logging: false,
    maxReflectionCallDepth: 100,
  };
  private options!: Required<FactoryOptions>;
  private loggers: FactoryLogger[] = [];
  private assigner: Assigner = this.defaultAssigner.bind(this);

  constructor(
    options?: FactoryOptions,
    private store: BaseMetadataStore = new DefaultMetadataStore()
  ) {
    this.options = {
      ...this.DEFAULT_OPTIONS,
      ...(options || {}),
    };
  }

  private defaultAssigner(prop: PropertyMetadata, object: any, value: any) {
    if (typeof value === 'function') {
      if (prop.computed) {
        Object.defineProperty(object, prop.name, {
          get: value.bind(object, object, prop),
        });
      } else {
        object[prop.name] = value();
      }
    } else {
      object[prop.name] = value;
    }
  }

  /**
   * Set a function to take charge of assigning values to
   * generated objects
   * @param fn
   */
  setAssigner(fn: Assigner) {
    this.assigner = fn;
  }

  /**
   * You can set a custom metadata store
   * for extension purposes.
   * The store should extends `BaseMetadataStore`
   * @param store
   */
  setMetadataStore(store: BaseMetadataStore) {
    this.store = store;
  }

  /**
   * Returns the instance of the metadata store
   */
  getStore() {
    return this.store;
  }

  /**
   * Attemps to log a message.
   * Won't work if logging is disabled.
   * @param msg
   */
  log(msg: string, force = false) {
    if (force || this.options.logging) {
      console.log(chalk.gray('[FixtureFactory] '), msg);
    }
  }

  newLogger(meta: ClassMetadata) {
    this.loggers.unshift(new FactoryLogger());
    const logger = this.logger();
    logger.start(meta);
    return logger;
  }

  logger() {
    return this.loggers[0];
  }

  printLogger(dispose = false) {
    const logger = this.logger();
    if (!logger) return;
    this.log('\n' + logger.log());
    if (dispose) {
      this.disposeLogger();
    }
  }

  disposeLogger() {
    this.loggers.shift();
  }

  /**
   * Register classes to be used by the factory
   * @param classTypes
   */
  register(classTypes: Class[]) {
    for (const classType of classTypes) {
      const collectedClasses = this.store.makeWithAssociations(classType);
      for (let collectedClass of collectedClasses) {
        this.store.make(classType);
        this.classTypes[collectedClass.name] = collectedClass;
      }
    }
  }

  /**
   * Generate fixtures
   * @param classType
   */
  make<T extends Class>(
    classType: T
    // options?: {
    //   maxReflectionCallDepth?: number;
    // }
  ): FactoryResult<InstanceType<T>> {
    this.store.make(classType);
    const meta = this.store.get(classType);
    let propsToIgnore: string[] = [];
    let userInput: DeepPartial<T> = {};

    // TODO: Change closs instance for eacth factory maxReflectionCallDepth
    const result: FactoryResult<InstanceType<T>> = {
      maxReflectionCallDepth: this.options.maxReflectionCallDepth,
      one: () => {
        let error = false;
        let object: any = {};
        const startDate = new Date();
        this.newLogger(meta);

        try {
          object = this._make(meta, classType, 1, propsToIgnore);
          for (const [key, value] of Object.entries(userInput)) {
            object[key] = value;
          }
        } catch (err) {
          this.log(
            chalk.red(`An error occured while generating "${meta.name}"`),
            true
          );
          console.error(err);
          error = true;
        }

        const elapsed = +new Date() - +startDate;
        this.logger()[error ? 'onError' : 'onDone'](elapsed);
        this.printLogger(true);
        return error ? null : object;
      },
      many: (x: number) => {
        return [...Array(x).keys()].map(() => result.one());
      },
      with: (input: DeepPartial<T>) => {
        userInput = input;
        for (const key of Object.keys(input)) {
          propsToIgnore.push(key);
        }
        return result;
      },
      ignore: (...props: any[]) => {
        propsToIgnore = propsToIgnore.concat(props as string[]);
        return result;
      },
    };
    return result;
  }

  protected _serialize(object: any) {
    // TODO: enable js plaing object
    return object;
  }

  protected _make(
    meta: ClassMetadata,
    classType: Class,
    depth: number,
    propsToIgnore: string[] = []
  ) {
    const object = new classType();
    for (const prop of meta.properties) {
      if (propsToIgnore.includes(prop.name)) continue;
      if (this.shouldIgnoreProperty(prop)) continue;
      this.assigner(prop, object, this.makeProperty(prop, meta, depth));
    }
    return this._serialize(object);
  }

  protected shouldIgnoreProperty(prop: PropertyMetadata) {
    if (prop.ignore) return true;
    return false;
  }

  protected makeProperty(
    prop: PropertyMetadata,
    meta: ClassMetadata,
    depth: number
  ): any {
    const stop = depth >= this.options.maxReflectionCallDepth;
    if (prop.input) {
      if (stop && !prop.scalar) {
        this.logger().onStopGeneration(prop, {});
        return null;
      }
      this.logger().onCustomProp(prop);
      return prop.input;
    }
    if (prop.scalar) {
      const value = this.makeScalarProperty(prop);
      this.logger().onNormalProp(prop, value);
      return value;
    } else if (prop.array) {
      if (stop) {
        this.logger().onStopGeneration(prop, []);
        return [];
      }
      return this.makeArrayProp(prop, meta, depth);
    }
    if (stop) {
      this.logger().onStopGeneration(prop, {});
      return null;
    }
    return this.makeObjectProp(meta, prop, depth);
  }

  protected makeScalarProperty(prop: PropertyMetadata) {
    if (prop.enum) {
      if (prop.items) {
        return faker.helpers.arrayElement(prop.items);
      }
    }
    switch (prop.type) {
      case 'string':
        return faker.random.word();
      case 'number':
        return faker.datatype.number();
      case 'boolean':
        return faker.datatype.boolean();
      case 'Date':
        return faker.date.recent();
      default:
        break;
    }
    throw new Error(`Can't generate a value for this scalar`);
  }

  private makeArrayProp(
    prop: PropertyMetadata,
    meta: ClassMetadata,
    depth: number
  ) {
    const amount = faker.datatype.number({
      max: prop.max,
      min: prop.min,
    });
    if (['string', 'number', 'boolean', 'Date'].includes(prop.type)) {
      return [...Array(amount).keys()].map(() =>
        this.makeProperty(
          {
            ...prop,
            array: false,
            scalar: true,
          },
          meta,
          depth
        )
      );
    }
    return [...Array(amount).keys()].map(() =>
      this.makeProperty(
        {
          ...prop,
          array: false,
        },
        meta,
        depth
      )
    );
  }

  // WARNING: This avoid only direct circular references.
  private makeObjectProp(
    meta: ClassMetadata,
    prop: PropertyMetadata,
    depth: number
  ) {
    const refClassMeta = this.store.get(prop.type);
    const props = this.findRefSideProps(meta, prop);

    const oldLogger = this.logger();
    const logger = this.newLogger(refClassMeta);

    const value = this._make(
      refClassMeta,
      this.classTypes[prop.type],
      depth + 1,
      props.map((p) => p.name)
    );

    oldLogger.onClassPropDone(prop, logger);
    this.disposeLogger();

    return value;
  }

  private findRefSideProps(meta: ClassMetadata, prop: PropertyMetadata) {
    const props: PropertyMetadata[] = [];
    const refClassMeta = this.store.get(prop.type);
    for (const refProp of refClassMeta.properties) {
      if (refProp.type === meta.name) {
        props.push(refProp);
      }
    }
    return props;
  }
}
