export class Email {
    private constructor(readonly value: string) { }

    static create(email: string): Email {
        if (!this.validate(email)) {
            throw new Error('E-mail inválido')
        }
        return new Email(email)
    }

    private static validate(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;
        return emailRegex.test(email)
    }
}

