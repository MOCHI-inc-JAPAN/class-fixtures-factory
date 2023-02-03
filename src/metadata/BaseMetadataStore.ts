import { AssociationDecoratorMetadata } from 'decorators/Association';
import { Class } from '../common/typings';
import { reflect } from '@plumier/reflect';

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
  computed?: boolean;
  min?: number;
  max?: number;
  input?: (...args: any[]) => any;
}

export abstract class BaseMetadataStore {
  protected store: Record<string, ClassMetadata> = {};
  get(classType: Class | string) {
    const name = typeof classType === 'string' ? classType : classType.name;
    const value = this.store[name];
    if (!value) throw new Error(`Cannot find metadata for class "${name}"`);
    return value;
  }
  makeWithAssociations(
    classType: Class,
    cache: Record<string, boolean> = {}
  ): Class[] {
    this.make(classType);
    const name = classType.name;
    if (!cache[name]) {
      cache[name] = true;
      const metadata = reflect(classType);
      const associationMetadata: AssociationDecoratorMetadata | undefined =
        metadata.decorators.find((v) => v.type === 'Association');
      if (!associationMetadata) {
        return [classType];
      }
      const associationClasses =
        typeof associationMetadata.value === 'function'
          ? associationMetadata.value()
          : associationMetadata.value;
      const madeAssoicationClasses = associationClasses
        .map((v) => this.makeWithAssociations(v, cache))
        .flat();
      return [classType, ...madeAssoicationClasses];
    }
    return [];
  }
  abstract make(classType: Class): ClassMetadata;
}
