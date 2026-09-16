# To-Do List — Frontend

Interface de uma lista de tarefas, feita com React, TypeScript e Vite.

## Como rodar localmente

### 1. Tenha os requisitos instalados

- **Node.js 24.x**, com o **npm** que acompanha a instalação.
- **Git**, se for clonar o repositório. Também é possível baixar e extrair o ZIP.
- Conexão com a internet para instalar as dependências e usar a API hospedada.

Confira se o Node.js e o npm estão disponíveis no terminal:

```bash
node --version
npm --version
```

### 2. Baixe o projeto e entre na pasta

```bash
git clone https://github.com/igulino/to-do-list-front.git
cd to-do-list-front
```

Se já baixou o projeto, basta abrir o terminal na pasta que contém o arquivo `package.json`.

### 3. Instale as dependências

```bash
npm ci
```

### 4. Inicie o frontend

```bash
npm run dev
```

Abra **http://localhost:5173** no navegador. Se essa porta estiver ocupada, use o endereço mostrado no terminal.

Mantenha o terminal aberto enquanto usa o projeto. Para encerrar, pressione `Ctrl+C`.

### 5. Crie sua conta e entre

Na tela inicial, clique em **Criar uma conta**, informe seus dados e use uma senha com pelo menos 8 caracteres. Depois, entre com o e-mail e a senha cadastrados.

## Preciso configurar alguma coisa?

**Para usar a configuração padrão, não.** Você não precisa criar um arquivo `.env`, preencher chaves ou tokens, instalar Docker, configurar banco de dados ou iniciar um backend local.

O Vite já encaminha as chamadas de `/api` para `https://to-do-list-29f1.onrender.com`, conforme definido em `vite.config.ts`. O cadastro, o login e as tarefas usam essa API remota e dependem de ela estar disponível. Os dados ficam no backend, não apenas no seu computador.

- **`VITE_API_URL`**: pode ficar ausente ou vazia. O arquivo `.env.example` é apenas uma referência; não é necessário copiá-lo para rodar localmente.
- **`PORT` e `RENDER_EXTERNAL_HOSTNAME`**: não precisam ser configuradas para o uso local padrão.

Se aparecer uma mensagem de conexão ou demora ao entrar, confira sua internet e tente novamente em instantes.
