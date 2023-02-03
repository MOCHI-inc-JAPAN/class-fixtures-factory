import { decorateClass, mergeDecorator } from '@plumier/reflect';
import { Class } from '../common/typings';

export type AssociationDecoratorValue = Array<Class> | (() => Array<Class>);
export type AssociationDecoratorMetadata = {
  type: 'Association';
  value: AssociationDecoratorValue;
};

/**
 * Decorator for providing metadata about a property
 * or for customizing the generate fixture
 * @param options
 */
export function Association(options?: AssociationDecoratorValue) {
  return mergeDecorator(
    decorateClass({
      type: 'Association',
      value: options,
    } as AssociationDecoratorMetadata)
  );
}
