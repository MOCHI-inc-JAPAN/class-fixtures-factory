import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { PropertyMetadata } from '.';
import { Class } from '..';
export declare class ClassValidatorAdapter {
    private metadata;
    extractMedatada(classType: Class): ValidationMetadata[];
    makePropertyMetadata(cvMeta: ValidationMetadata, existingProp: PropertyMetadata | undefined): PropertyMetadata | Partial<PropertyMetadata> | null;
}
//# sourceMappingURL=ClassValidatorAdapter.d.ts.map