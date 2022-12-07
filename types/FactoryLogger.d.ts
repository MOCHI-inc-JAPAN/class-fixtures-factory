import { ClassMetadata, PropertyMetadata } from './metadata';
export declare class FactoryLogger {
    private rootTree;
    private tree;
    private duplicates;
    start(meta: ClassMetadata, number?: number): void;
    onIgnoreProp(prop: PropertyMetadata): void;
    onCustomProp(prop: PropertyMetadata): void;
    onClassPropDone(prop: PropertyMetadata, targetLogger: FactoryLogger): void;
    onNormalProp(prop: PropertyMetadata, value: any): void;
    onClassValidator(prop: PropertyMetadata, value: any): void;
    onDone(duration: number): void;
    onError(duration: number): void;
    log(): string;
}
//# sourceMappingURL=FactoryLogger.d.ts.map