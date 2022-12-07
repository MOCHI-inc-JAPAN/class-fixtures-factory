import { BaseMetadataStore, ClassMetadata, PropertyMetadata } from './metadata';
import { Class } from './common/typings';
import { FactoryLogger } from './FactoryLogger';
export interface FactoryOptions {
    logging?: boolean;
    maxDepth?: number;
}
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : DeepPartial<T[P]>;
};
export interface FactoryResult<T> {
    one: () => T;
    many: (x: number) => T[];
    with: (input: DeepPartial<T>) => FactoryResult<T>;
    ignore: (...props: (keyof T)[]) => FactoryResult<T>;
}
export type Assigner = (prop: PropertyMetadata, object: any, value: any) => void;
export declare class FixtureFactory {
    private store;
    private classTypes;
    private DEFAULT_OPTIONS;
    private options;
    private depthness;
    private loggers;
    private assigner;
    constructor(options?: FactoryOptions, store?: BaseMetadataStore);
    private defaultAssigner;
    /**
     * Set a function to take charge of assigning values to
     * generated objects
     * @param fn
     */
    setAssigner(fn: Assigner): void;
    /**
     * You can set a custom metadata store
     * for extension purposes.
     * The store should extends `BaseMetadataStore`
     * @param store
     */
    setMetadataStore(store: BaseMetadataStore): void;
    /**
     * Returns the instance of the metadata store
     */
    getStore(): BaseMetadataStore;
    /**
     * Attemps to log a message.
     * Won't work if logging is disabled.
     * @param msg
     */
    log(msg: string, force?: boolean): void;
    newLogger(meta: ClassMetadata): FactoryLogger;
    logger(): FactoryLogger;
    printLogger(dispose?: boolean): void;
    disposeLogger(): void;
    /**
     * Register classes to be used by the factory
     * @param classTypes
     */
    register(classTypes: Class[]): void;
    /**
     * Generate fixtures
     * @param classType
     */
    make<T extends Class>(classType: T): FactoryResult<InstanceType<T>>;
    protected _make(meta: ClassMetadata, classType: Class, propsToIgnore?: string[]): any;
    protected shouldIgnoreProperty(prop: PropertyMetadata): boolean;
    protected makeProperty(prop: PropertyMetadata, meta: ClassMetadata): any;
    protected makeScalarProperty(prop: PropertyMetadata): any;
    private makeArrayProp;
    private makeObjectProp;
    private findRefSideProps;
}
export {};
//# sourceMappingURL=FixtureFactory.d.ts.map