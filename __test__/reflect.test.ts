import { reflect, noop } from '@plumier/reflect';

class AnimalModel {
  @noop()
  id!: number;

  @noop()
  name!: object;
}

describe('reflect type', () => {
  it('reflect', () => {
    expect(reflect(AnimalModel)).toBeTruthy();
  });
});
