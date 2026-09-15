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
- “Criar task”, ao lado de “Atualizar”, abre um modal com título obrigatório (até 200 caracteres), descrição opcional e status obrigatório (até 100 caracteres).
- “Status já existentes” fica destacado quando selecionado e mostra uma caixa de seleção. Como a API não oferece um catálogo independente, o modal consulta as páginas de tarefas e reúne os status únicos. Se não houver status, orienta a usar “Inserir novo status”, que exibe um campo de texto.
- A criação envia `POST /api/tasks` com `{ title, description, status }` e o cookie de autenticação. Espaços nas extremidades dos campos digitados são removidos e a descrição vazia é enviada como `null`. A resposta esperada é `{ task }`.
- Após a confirmação, o modal fecha, exibe uma mensagem de sucesso e atualiza a primeira página para mostrar a tarefa mais recente, preservando as alterações de status pendentes. Erros mantêm os dados no formulário, inclusive título duplicado (`409`); sessão expirada (`401`) retorna ao login.
- Durante o envio, os controles do modal ficam desabilitados para evitar duplicação. O modal permite navegação por teclado e fechamento por Cancelar, pelo botão de fechar ou por Escape quando não há envio em andamento.
- Título e descrição têm um lápis que aparece ao passar o mouse ou focar o campo pelo teclado; no celular, ele fica visível. Cada campo abre uma edição no próprio card com “Salvar” e “Cancelar”. Enter salva o título, Ctrl/Cmd+Enter salva qualquer campo e Escape cancela; Enter na descrição insere uma nova linha.
- A edição envia `PATCH /api/tasks/:id` somente com `{ title }` ou `{ description }`. O título continua obrigatório e limitado a 200 caracteres; apagar a descrição envia `null`. O card reflete os dados confirmados pela API sem perder sua posição nem as mudanças de status pendentes. Erros, incluindo título duplicado, mantêm o texto digitado para correção.
- Enquanto um campo estiver em edição, a movimentação, exclusão, paginação e outras ações do quadro ficam bloqueadas até salvar ou cancelar. O envio impede cliques duplicados.
- O ícone de lixeira de cada task envia `DELETE /api/tasks/:id`, com o cookie de autenticação, e aceita a resposta `204` sem corpo. Durante a exclusão, os controles ficam bloqueados e a lixeira indica o andamento. A tarefa só é removida após a confirmação da API; falhas mostram uma mensagem e preservam a tarefa.
- Ao excluir, somente a pendência da task removida é descartada; as demais alterações continuam disponíveis. O quadro atualiza os totais e recarrega a página, voltando à última página válida se necessário. Uma falha nessa atualização não restaura a task já excluída.
- Inclui carregamento, estado vazio, atualização manual e nova tentativa após erro, preservando a página anterior se uma consulta falhar.

## Organização da dashboard

- `src/components/Dashboard.tsx`: composição da página.
- `src/components/dashboard/`: cabeçalho, boas-vindas, quadro, colunas de status, cards, estados de carregamento/vazio, paginação e barra de salvamento.
- `src/hooks/useTaskBoard.ts`: carregamento e paginação, alterações pendentes, movimentação entre status, desfazer e salvar, incluindo falhas parciais e sessão expirada.
- `src/hooks/useTaskCreation.ts`: consulta dos status existentes e envio de novas tarefas, com carregamento, erros e sessão expirada.
- `src/hooks/useTaskEditing.ts`: sessão de edição de título/descrição e salvamento via PATCH, com prevenção de envios simultâneos e tratamento de sessão expirada.
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
