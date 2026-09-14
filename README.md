# TDL — Frontend

Login, cadastro e dashboard de tarefas responsivos em React e TypeScript, com as imagens de `public/`.

## Desenvolvimento

1. Inicie o backend em `C:\TDL-BACK` com `npm run dev` (porta 3000).
2. Neste diretório, execute `npm install` e `npm run dev`.
3. Acesse o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

O proxy do Vite encaminha `/api` ao backend em `http://localhost:3000`. Para mudar o destino local, ajuste `target` em `vite.config.ts`. Para definir uma URL base que o navegador acessará diretamente, copie `.env.example` para `.env.local` e ajuste `VITE_API_URL`.

## Autenticação

- Login: `POST /api/auth/login`, com `{ email, password }`.
- Cadastro: `POST /api/auth/register`, com `{ name, email, password }`.
- As requisições usam `credentials: 'include'`. O JWT fica no cookie HttpOnly definido pelo backend.
- A opção de lembrar e-mail guarda somente o e-mail no navegador; senha e token não são armazenados pelo frontend.
- Após o login, o frontend redireciona para `/dashboard`. O cadastro continua retornando ao formulário de login.
- A dashboard consulta a API usando o cookie existente, inclusive ao recarregar a página ou acessar a URL diretamente. Uma resposta `401` retorna ao login com uma mensagem de sessão expirada.

## Dashboard

- Consulta `GET /api/tasks?page=N`, usando a mesma base `VITE_API_URL` e o mesmo proxy do login.
- Espera `{ tasks, pagination: { page, limit, total, totalPages } }`; o backend define 5 tarefas por página.
- Agrupa as tarefas da página pelo valor exato de `status`, preservando a ordem recebida. Cada coluna mostra o status e a quantidade de tarefas, com título e descrição em cada card. Descrições nulas ou vazias aparecem como “Sem descrição.”.
- As setas abaixo do quadro consultam a página anterior ou seguinte. A paginação é global, pois a API pagina tarefas; um mesmo status pode aparecer em páginas diferentes.
- O layout comporta cinco colunas de status lado a lado no desktop e permite rolagem horizontal em telas menores. São usados os status retornados pela API, sem criar status fictícios para preencher colunas.
- Arraste uma tarefa para outra coluna ou use o seletor “Mover para” no card, inclusive por teclado ou no celular. A tarefa entra abaixo das demais no destino, e a coluna de origem continua disponível mesmo vazia.
- As mudanças ficam pendentes até clicar em “Salvar alterações”. Cada tarefa alterada gera `PATCH /api/tasks/:id` com apenas `{ "status": "novo status" }`, enviando o cookie de autenticação. Mover novamente a mesma tarefa altera apenas o destino final; voltar ao status original remove a pendência.
- As pendências são mantidas ao paginar ou atualizar o quadro. “Desfazer alterações” descarta todas as mudanças ainda não salvas. Se parte dos PATCHs falhar, as mudanças confirmadas são mantidas e só as demais continuam pendentes para nova tentativa. Os controles ficam bloqueados durante o salvamento.
- A ordem local de arrasto não é persistida: ao recarregar os dados, vale a ordenação do backend. As colunas vazias são mantidas durante a edição da página atual, mas a API não fornece um catálogo independente de status.
- Inclui carregamento, estado vazio, atualização manual e nova tentativa após erro, preservando a página anterior se uma consulta falhar.

## Organização da dashboard

- `src/components/Dashboard.tsx`: composição da página.
- `src/components/dashboard/`: cabeçalho, boas-vindas, quadro, colunas de status, cards, estados de carregamento/vazio, paginação e barra de salvamento.
- `src/hooks/useTaskBoard.ts`: carregamento e paginação, alterações pendentes, movimentação entre status, desfazer e salvar, incluindo falhas parciais e sessão expirada.
- `src/hooks/useTaskDrag.ts`: eventos de arrasto, tarefa arrastada e destaque da coluna de destino.
- `src/utils/taskBoard.ts`: agrupamento das tarefas, cálculo da paginação e cores dos status.
- `src/types/taskBoard.ts`: tipos compartilhados do quadro.
- `src/services/tasks.ts`: comunicação HTTP com a API; os componentes recebem dados e callbacks pelos props.

## Verificação e publicação

```sh
npm run lint
npm run build
npm run preview
```

O build fica em `dist/`. Em produção, encaminhe `/api` ao backend no mesmo domínio e configure o fallback das rotas do frontend (como `/dashboard`) para `index.html`. Para outra origem do mesmo site, configure `VITE_API_URL` e autorize a origem exata no `CORS_ORIGIN` do backend, respeitando o cookie `SameSite=Lax`. HTTPS é necessário para o cookie `Secure` em produção. O proxy do Vite não faz parte dos arquivos estáticos publicados.
