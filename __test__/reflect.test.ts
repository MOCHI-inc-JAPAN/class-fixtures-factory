import { reflect, noop } from '@plumier/reflect';

class AnimalModel {
  @noop()
  id!: number;

  @noop()
  name!: object;
}

describe('reflect type', () => {
  it('reflect', () => {
    console.log(reflect(AnimalModel));
    expect(reflect(AnimalModel)).toBeTruthy();
  });
});
