import { Name } from '../../../domain/value-objects/Name';

describe('Name', () => {
  it('should create a valid name', () => {
    const name = Name.create('John Doe');
    expect(name.value).toBe('John Doe');
  });

  it('should throw an error for an empty name', () => {
    expect(() => Name.create('')).toThrow('Invalid name');
  });
});
