export class Imovel {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly vinylRecordId: string,
    readonly loanDate: Date,
    readonly returnDate?: Date
  ) {}

  static create(
    id: string,
    userId: string,
    vinylRecordId: string,
    loanDate: Date,
    returnDate?: Date
  ): Imovel {
    return new Imovel(id, userId, vinylRecordId, loanDate, returnDate);
  }

  return(): Imovel {
    if (this.returnDate) {
      throw new Error('Loan already returned');
    }
    return new Imovel(this.id, this.userId, this.vinylRecordId, this.loanDate, new Date());
  }
}
