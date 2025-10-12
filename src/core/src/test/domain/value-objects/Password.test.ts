import { Password } from "../../../domain/value-objects/Password"

describe("Password", () => {
    it('Deve criar a senha válida', () => {
        const value = "'Valid12!'"
        const pass = Password.create(value)
        if (pass) {
            expect(pass.value).toBe(value)
        }
    })
    it("Deve lançar um erro de menos de 8 caracteres", () => {
        expect(() => Password.create('123')).toThrow()
    })
    it("Deve lançar um erro se não tiver letra maiúscula", () => {
        expect(() => Password.create('12345678')).toThrow()
    })
    it("Deve lançar um erro se não tiver letra minúscula", () => {
        expect(() => Password.create('1234567A')).toThrow()
    })
    it("Deve lançar um erro se não tiver número", () => {
        expect(() => Password.create('abcDEFGH')).toThrow()
    })
    it("Deve lançar um erro se não tiver caracter especial", () => {
        expect(() => Password.create('abcDEF12')).toThrow()
    })
})
