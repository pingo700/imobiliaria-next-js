export class Name {
  private constructor(readonly value: string) {}

  static create(name: string): Name {
    if (!this.validate(name)) {
      throw new Error('Invalid name');
    }
    return new Name(name);
  }

  private static validate(name: string): boolean {
    return name.length > 0;
  }
}
