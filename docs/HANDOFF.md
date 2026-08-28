# Guia de continuidade no Codex Desktop

## Objetivo do produto

O Pila é um gerenciador financeiro pessoal, em português brasileiro e sem
backend. Ele permite cadastrar contas, categorias, transações e orçamentos,
visualizar indicadores e importar lançamentos OFX/OFC. A persistência ocorre no
IndexedDB do próprio navegador; limpar os dados do site também remove os dados
financeiros.

## Preparação do ambiente

Requisitos: Node.js compatível com Vite 5 e npm.

```bash
npm install
npm run dev
```

Comandos de validação disponíveis:

```bash
npm run lint
npm run build
npx vitest run
```

> O `package.json` ainda não possui um script `test`; use o comando do Vitest
> acima até que esse script seja adicionado.

## Arquitetura em poucas palavras

- `src/App.tsx` configura providers, layout e rotas.
- `src/context/FinanceContext.tsx` expõe dados e operações financeiras para a
  árvore React.
- `src/hooks/useFinanceData.ts` carrega os dados e calcula os agregados usados
  pelas telas.
- `src/hooks/use*Operations.ts` concentra operações CRUD e feedback ao usuário.
- `src/lib/db/` define o schema e as operações sobre IndexedDB.
- `src/pages/` contém as telas associadas às rotas.
- `src/components/transactions/` contém a listagem e os controles de
  transações.
- `src/lib/importers/` contém leitura de arquivo e conversão OFX.
- `src/tests/` contém testes de banco, hooks e importação.

## Estado atual dos trabalhos recentes

### Importação OFX

- A descrição importada concatena `<NAME> - <MEMO>` quando os dois campos
  existem e usa o campo disponível quando apenas um deles existe.
- Toda transação convertida exige um `accountId` inteiro e positivo.
- A conta escolhida no diálogo é enviada para todas as transações importadas.
- O parser ainda usa expressões regulares e retorna uma lista vazia em caso de
  erro; ele não oferece diagnóstico detalhado, prevenção de duplicidades ou uma
  etapa de pré-visualização.

### Filtros da lista de transações

- A busca considera descrição e observações.
- O filtro de tipo aceita todas, receitas ou despesas.
- O filtro de contas aceita múltiplas contas.
- Nenhuma conta selecionada significa “todas as contas”.
- Os filtros são combinados antes da ordenação decrescente por data.

### Configurações

Os botões de exportar, importar, verificar e redefinir dados são apenas
placeholders com mensagens toast. Nenhum deles altera ou transfere dados ainda.

## Próximas tarefas recomendadas

1. **Robustez do OFX**
   - substituir o parser baseado em regex por parsing tolerante a OFX SGML e
     OFX XML;
   - validar datas e valores e apresentar erros úteis por arquivo/lançamento;
   - detectar encoding a partir dos bytes do arquivo;
   - criar pré-visualização e detecção de duplicidades;
   - manter a obrigatoriedade da conta e a regra de descrição `NAME - MEMO`;
   - ampliar testes com arquivos malformados, campos ausentes e encodings reais.
2. **Ações de Configurações**
   - criar um serviço versionado de backup JSON;
   - validar integralmente o arquivo antes de restaurar qualquer store;
   - definir e documentar a política de conflito (substituir ou mesclar);
   - implementar reset com confirmação e recriação dos dados iniciais;
   - recarregar o `FinanceContext` depois de importar ou redefinir;
   - testar integridade referencial e saldos após cada operação.
3. **Dívida técnica próxima**
   - trocar o `any` de `handleEditClick` em `useTransactionPage` por
     `Transaction`;
   - decidir entre adotar TanStack Query na camada de dados ou remover o
     provider/dependência não utilizados;
   - adicionar `"test": "vitest run"` aos scripts do npm;
   - revisar a acessibilidade dos filtros, diálogos e tabelas.

## Regras de domínio que devem ser preservadas

- Uma transação sempre referencia uma conta e uma categoria existentes.
- Valores persistidos são positivos; `type` determina se o lançamento é receita
  ou despesa.
- Inclusão, edição e exclusão de transações devem manter o saldo da conta
  consistente.
- Relacionamentos usam IDs numéricos do IndexedDB.
- Datas persistidas são objetos `Date`; backups JSON precisarão convertê-las e
  restaurá-las explicitamente.
- Exclusões e restaurações não devem deixar transações ou orçamentos órfãos.

## Checklist antes de entregar uma alteração

1. Conferir `git diff` e garantir que lockfiles só mudaram intencionalmente.
2. Executar `npm run lint`.
3. Executar `npx vitest run`.
4. Executar `npm run build`.
5. Para mudanças visuais, testar desktop e viewport móvel e registrar uma
   captura de tela.
6. Atualizar estes documentos quando o estado ou as decisões acima mudarem.
