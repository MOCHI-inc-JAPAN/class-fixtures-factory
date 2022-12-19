import {
  BaseMetadataStore,
  ClassMetadata,
  PropertyMetadata,
} from './BaseMetadataStore';
import { Class } from '../common/typings';
import { reflect, PropertyReflection } from '@plumier/reflect';
import { FixtureOptions } from '../decorators/Fixture';
import { getEnumValues } from '../common/utils';
import { ClassValidatorAdapter } from './ClassValidatorAdapter';
import { faker } from '@faker-js/faker';

export class DefaultMetadataStore extends BaseMetadataStore {
  private cvAdapter = new ClassValidatorAdapter();

  constructor(private readonly acceptPartialResult = false) {
    super();
  }
  /**
   * Make type metadata for a class
   * @param classType
   */
  make(classType: Class): ClassMetadata {
    // WARNING: '@plumier/reflect depends on initialized order when relations have circular references.
    // If parent relation class is initialized the typeClassification may be Privimitive instead of Class.
    // This may affect one to many relations and cause bug.
    const rMetadata = reflect(classType);
    const cvMetadata = this.cvAdapter.extractMedatada(classType);
    const unknownTypes = new Set<string>();
    let properties = rMetadata.properties
      .map((prop) => this.makePropertyMetadata(prop)!)
      .filter(Boolean);
    for (const cvMeta of cvMetadata) {
      const existingProp = properties.find(
        (prop) => prop.name === cvMeta.propertyName
      );
      const deducedProp = this.cvAdapter.makePropertyMetadata(
        cvMeta,
        existingProp
      ) as PropertyMetadata | null;
      if (deducedProp) {
        if (existingProp) {
          properties = properties.map((prop) =>
            prop.name === cvMeta.propertyName ? deducedProp : existingProp
          );
        } else {
          properties.push(deducedProp);
        }
        unknownTypes.delete(cvMeta.propertyName);
      } else {
        const typeResolved = !!properties.find(
          (v) => v.name === cvMeta.propertyName && !!v.type
        );
        if (!typeResolved) {
          unknownTypes.add(cvMeta.propertyName);
        }
      }
    }

    if (unknownTypes.size > 0) {
      throw new Error(
        `Couldn't extract the type of ${[...unknownTypes]
          .map((v) => `"${v}"`)
          .join(', ')}. Use @Fixture({ type: () => Foo })`
      );
    }

    const classMetadata: ClassMetadata = {
      name: rMetadata.name,
      properties: properties.filter(Boolean),
    };
    return (this.store[classType.name] = classMetadata);
  }

  private makePropertyMetadata(
    prop: PropertyReflection
  ): PropertyMetadata | null {
    const decoratorInput = this.getFixtureDecorator(prop);
    const meta: Partial<PropertyMetadata> = {
      name: prop.name,
      scalar: prop.typeClassification === 'Primitive' && prop.type !== Array,
      computed: true,
    };

    if (decoratorInput || decoratorInput === false) {
      if (typeof decoratorInput === 'function') {
        meta.input = decoratorInput.bind(decoratorInput, faker);
      } else if (
        !Array.isArray(decoratorInput) &&
        typeof decoratorInput === 'object' &&
        decoratorInput !== null
      ) {
        if (decoratorInput.ignore) return null;
        meta.computed = decoratorInput.computed ?? meta.computed;
        meta.input = decoratorInput?.get?.bind(decoratorInput, faker);
        meta.min = decoratorInput.min || 1;
        meta.max = decoratorInput.max || 3;
        let inputType: any = decoratorInput.type?.();
        if (inputType) {
          if (Array.isArray(inputType)) {
            inputType = inputType[0];
            meta.array = true;
          }
          if (!inputType.prototype) {
            throw new Error(
              `Only pass class names to "type" in @Fixture({ type: () => Foo}) for "${meta.name}"`
            );
          }
          const { name } = inputType;
          if (!['string', 'number', 'boolean'].includes(name.toLowerCase())) {
            meta.type = name;
            meta.scalar = false;
          } else {
            meta.type = name.toLowerCase();
          }
        }
        if (decoratorInput.enum) {
          meta.enum = true;
          meta.items = getEnumValues(decoratorInput.enum);
        }
      } else if (typeof decoratorInput !== 'undefined') {
        meta.input = () => decoratorInput;
        meta.computed = false;
      }
    }
    if (!meta.type) {
      if (!prop.type) {
        if (this.acceptPartialResult) {
          return meta as PropertyMetadata;
        }
      } else if (prop.type === Array) {
        throw new Error(
          `The type of "${meta.name}" seems to be an array. Use @Fixture({ type: () => Foo })`
        );
      } else if (prop.type instanceof Function) {
        const { name } = prop.type as Function;
        if (!['string', 'number', 'boolean'].includes(name.toLowerCase())) {
          meta.type = name;
        } else {
          meta.type = name.toLowerCase();
        }
      }
    }
    if (!meta.type) {
      throw new Error(
        `Couldn't extract the type of "${meta.name}". Use @Fixture({ type: () => Foo })`
      );
    }
    return meta as PropertyMetadata;
  }

  private getFixtureDecorator(prop: PropertyReflection): FixtureOptions {
    return prop.decorators.find((v) => v.type === 'Fixture')?.value || null;
  }
}
