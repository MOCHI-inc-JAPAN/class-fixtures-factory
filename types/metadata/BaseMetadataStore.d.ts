import { Class } from '../common/typings';
export interface ClassMetadata {
    name: string;
    properties: PropertyMetadata[];
}
export interface PropertyMetadata {
    name: string;
    type: string;
    scalar?: boolean;
    enum?: boolean;
    items?: any[];
    array?: boolean;
    ignore?: boolean;
    min?: number;
    max?: number;
    input?: (...args: any[]) => any;
}
export declare abstract class BaseMetadataStore {
    protected store: Record<string, ClassMetadata>;
    get(classType: Class | string): ClassMetadata;
    abstract make(classType: Class): ClassMetadata;
}
//# sourceMappingURL=BaseMetadataStore.d.ts.map