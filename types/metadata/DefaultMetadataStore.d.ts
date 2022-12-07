import { BaseMetadataStore, ClassMetadata } from './BaseMetadataStore';
import { Class } from '../common/typings';
export declare class DefaultMetadataStore extends BaseMetadataStore {
    private readonly acceptPartialResult;
    private cvAdapter;
    constructor(acceptPartialResult?: boolean);
    /**
     * Make type metadata for a class
     * @param classType
     */
    make(classType: Class): ClassMetadata;
    private makePropertyMetadata;
    private getFixtureDecorator;
}
//# sourceMappingURL=DefaultMetadataStore.d.ts.map