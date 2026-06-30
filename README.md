# 🏪 Mercadinho da Professora Amanda

Um ponto de venda educativo, lúdico e 100% em português do Brasil. O Mercadinho foi criado para transformar noções de dinheiro, escolhas, responsabilidade, estoque e convivência em uma brincadeira organizada dentro da sala de aula.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/pronto_para-Vercel-000?logo=vercel)

## ✨ O que o aplicativo faz

- cadastra produtos com nome, qualquer emoji Unicode, preço em reais e estoque;
- oferece biblioteca completa de emojis com busca em português, categorias e itens recentes;
- cadastra clientes com nome, idade, avatar personalizável, limite de crédito e indicadores de comportamento;
- permite escolher avatares entre rostos, pessoas, profissões e diferentes tons de pele;
- registra boas atitudes e pontos a melhorar;
- monta uma cesta, respeita o estoque e impede compras acima do crédito disponível;
- adiciona automaticamente cada compra ao saldo do cliente;
- baixa o estoque ao concluir uma venda;
- registra pagamentos parciais ou totais;
- mantém histórico completo de vendas e pagamentos;
- mostra indicadores de faturamento, valores a receber e estoque baixo;
- salva os dados automaticamente no navegador;
- exporta e importa backups em JSON;
- funciona em computador, tablet e celular;
- inclui uma experiência em tela inteira com visual cozy, acolhedor e infantil.

## 🚀 Como usar o Mercadinho

### 1. Visão geral

A tela inicial mostra quatro números importantes:

- **Vendido no total:** soma de todas as vendas;
- **A receber:** soma dos saldos usados pelos clientes;
- **Na prateleira:** quantidade total de unidades no estoque;
- **Clientes:** número de crianças cadastradas.

Também aparecem produtos com três unidades ou menos e as atividades mais recentes.

### 2. Cadastrar produtos

1. Entre em **Produtos** no menu lateral.
2. Clique em **Novo produto**.
3. Informe o nome.
4. Escolha um emoji para representar o item.
5. Digite o preço em reais.
6. Digite a quantidade em estoque.
7. Clique em **Salvar produto**.

Use **Editar** para alterar qualquer informação. A exclusão retira o produto da loja, mas preserva as vendas antigas no histórico.

### 3. Cadastrar clientes

1. Entre em **Clientes**.
2. Clique em **Novo cliente**.
3. Informe nome e idade.
4. Escolha um avatar.
5. Defina o limite de crédito.
6. Informe os registros iniciais de boas atitudes e pontos a melhorar.
7. Clique em **Salvar cliente**.

O **limite de crédito** é o valor máximo que a criança pode acumular em compras antes de pagar. Por exemplo: com limite de R$ 30,00 e saldo usado de R$ 8,00, ela ainda pode comprar R$ 22,00.

Os botões `+` e `−` nos cartões permitem atualizar os indicadores de comportamento rapidamente. Esses indicadores não alteram dinheiro ou crédito automaticamente; a professora decide como utilizá-los na dinâmica pedagógica.

### 4. Fazer uma venda

1. Abra **Caixa** no menu ou clique em **Nova venda**.
2. Escolha o cliente.
3. Adicione produtos com o botão `+`.
4. Confira a cesta e o total no recibo.
5. Clique em **Concluir venda**.

Ao concluir:

- o estoque dos produtos é reduzido;
- o total é acrescentado ao saldo usado do cliente;
- a operação aparece no histórico.

O botão de concluir fica desativado quando não há cliente, a cesta está vazia ou o total ultrapassa o crédito disponível.

### 5. Registrar um pagamento

1. Entre em **Clientes**.
2. Localize a criança.
3. Clique em **Registrar pagamento**.
4. Informe um valor entre zero e o saldo atual.

O pagamento pode ser parcial ou total. Ele reduz o saldo usado, libera crédito novamente e fica registrado no histórico.

### 6. Consultar o histórico

Entre em **Histórico** para ver compras e pagamentos em ordem cronológica. Use os filtros **Tudo**, **Vendas** ou **Pagamentos**. Cada venda lista os produtos e suas quantidades.

## 💾 Dados, backup e privacidade

Os dados são salvos no `localStorage` do navegador. Isso significa:

- não há conta ou login;
- nenhum dado é enviado a um servidor;
- as informações permanecem naquele navegador e dispositivo;
- apagar os dados do navegador pode apagar os registros do Mercadinho;
- abrir o site em outro computador começa com outra base de dados.

### Fazer backup

No rodapé do menu lateral, clique em **Salvar**. Um arquivo com nome parecido com `backup-mercadinho-2026-06-30.json` será baixado.

### Restaurar backup

Clique no botão com ícone de envio ao lado de **Salvar**, escolha o arquivo JSON e confirme a substituição. É recomendável salvar um backup no fim de cada semana ou atividade importante.

> Para sincronização automática entre vários dispositivos seria necessário adicionar banco de dados e autenticação em uma versão futura.

## 🧑‍💻 Rodar no computador

### Requisitos

- Node.js 20 ou mais recente;
- npm, pnpm ou yarn.

### Instalação

```bash
git clone https://github.com/kiltonfernandes/MercadinhoDaProfessoraAmanda.git
cd MercadinhoDaProfessoraAmanda
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

### Comandos disponíveis

| Comando | Finalidade |
|---|---|
| `npm run dev` | inicia o ambiente de desenvolvimento |
| `npm run build` | valida o TypeScript e gera a versão de produção |
| `npm run preview` | abre localmente a versão de produção |
| `npm run lint` | verifica qualidade e padrões do código |

## ▲ Publicar manualmente na Vercel

O projeto já inclui `vercel.json` e está pronto para deploy como aplicação Vite.

1. Acesse [vercel.com](https://vercel.com) e entre na sua conta.
2. Clique em **Add New → Project**.
3. Importe `kiltonfernandes/MercadinhoDaProfessoraAmanda`.
4. Selecione o framework **Vite** caso ele não seja identificado automaticamente.
5. Confirme:
   - **Build Command:** `npm run build`;
   - **Output Directory:** `dist`;
   - **Install Command:** `npm install`.
6. Não é necessário cadastrar variáveis de ambiente.
7. Clique em **Deploy**.

Cada novo push na branch conectada gera um novo deploy automaticamente. Como os dados ficam no navegador, um novo deploy não apaga os registros já salvos pelos usuários.

## 🏗️ Estrutura do projeto

```text
.
├── src/
│   ├── App.tsx       # telas, regras de negócio e componentes
│   ├── data.ts       # dados iniciais e formatadores
│   ├── hooks.ts      # persistência no localStorage
│   ├── main.tsx      # inicialização do React
│   ├── styles.css    # sistema visual responsivo
│   └── types.ts      # tipos do domínio
├── index.html
├── vercel.json
├── vite.config.ts
└── package.json
```

## 📐 Regras de negócio

- estoque e valores nunca podem ser negativos;
- uma venda só é concluída se houver unidades suficientes;
- o total da compra não pode ultrapassar o crédito disponível;
- excluir um cliente com saldo pendente é bloqueado;
- excluir clientes e produtos não apaga transações antigas;
- pagamentos nunca podem ser maiores que o saldo atual;
- preço zero é permitido para atividades com itens gratuitos;
- os indicadores de comportamento são independentes do crédito.

## 🎨 Direção visual

A interface se inspira na sensação de jogos cozy: cores quentes, cantos arredondados, elementos desenhados como cartões e recibos, emojis amigáveis e linguagem leve. A identidade foi construída do zero e não utiliza imagens, marcas ou artes proprietárias dos jogos de referência.

## 🔭 Ideias para próximas versões

- login de professora;
- sincronização com Supabase ou Firebase;
- múltiplas turmas e mercadinhos;
- impressão de recibos;
- relatórios por período e por aluno;
- recompensas configuráveis associadas ao comportamento;
- modo de alto contraste e avatares personalizados;
- instalação como PWA para uso offline.

## 📄 Licença

Projeto de uso educacional. Defina uma licença antes de redistribuir publicamente ou aceitar contribuições externas.

---

Feito com carinho para a Professora Amanda e sua turminha. 🌻
