# Estrutura de Testes - Imobiliária Next.js

Este pacote contém toda a estrutura de testes para o projeto imobiliaria-next-js.

## Instalação

1. Copie todos os arquivos para a raiz do seu projeto
2. Instale as dependências:

```bash
npm install --save-dev @testing-library/jest-dom@^6.9.1 @testing-library/react@^16.3.0 @types/jest@^30.0.0 jest@^30.2.0 jest-environment-jsdom@^30.2.0 ts-jest@^29.4.5 ts-node@^10.9.2
```

3. Adicione os scripts ao seu package.json (já incluídos em package.json.example):

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Estrutura de Diretórios

```
├── jest.config.ts          # Configuração do Jest
├── jest.setup.ts           # Setup do Testing Library
└── src/tests/
    ├── components/         # Testes de componentes
    │   ├── admin/         # Componentes administrativos
    │   └── ThemeToggle.test.tsx
    ├── pages/             # Testes de páginas
    ├── integration/       # Testes de integração
    └── hooks/             # Testes de hooks customizados
```

## Comandos

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## Adaptações Necessárias

Você precisará ajustar os imports nos testes de acordo com:
- Os caminhos reais dos seus componentes
- As props específicas dos seus componentes
- Os textos e labels exatos usados na sua aplicação
- As APIs e serviços específicos do seu projeto

## Padrões Utilizados

- **Jest**: Framework de testes
- **Testing Library**: Biblioteca para testar componentes React
- **jest-dom**: Matchers customizados para assertions de DOM

## Cobertura de Testes

Os testes cobrem:
- ✅ Componentes de UI (admin e public)
- ✅ Páginas (home, login, 404)
- ✅ Fluxos de integração (autenticação, CRUD)
- ✅ Hooks customizados

## Boas Práticas

1. Escreva testes que simulam o comportamento do usuário
2. Use queries acessíveis (getByRole, getByLabelText)
3. Evite testar detalhes de implementação
4. Mock apenas o necessário (APIs externas, módulos complexos)
5. Mantenha os testes simples e legíveis
