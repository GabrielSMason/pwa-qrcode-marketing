# Promoção Biscoitos X — PWA

Aplicativo PWA para campanha de marketing: o cliente cadastra QR-Codes das embalagens, acompanha os códigos cadastrados, e recebe uma notificação push caso seu código seja sorteado.

## Stack utilizada

- **Frontend**: Vue 3 + Vite, vue-router, axios, html5-qrcode
- **Backend**: Node.js + Express + Mongoose (MongoDB)
- **Notificações**: web-push (protocolo VAPID)
- **Autenticação**: JWT + bcrypt

## Estrutura do repositório

├── frontend/ # PWA em Vue 3

└── backend/ # API REST + CLI de notificação

## Pré-requisitos

- Node.js 18 ou superior (`node --version`)
- MongoDB instalado e rodando localmente na porta padrão (27017)
- ngrok (necessário apenas para testar no celular via HTTPS)

## 1. Configurar o MongoDB

Confirme que o MongoDB está instalado e rodando:

```bash
mongod --version
systemctl status mongodb   # Linux com systemd
```

Se não estiver rodando:

```bash
sudo systemctl start mongodb
```

Teste a conexão:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

Deve retornar `{ ok: 1 }`.

## 2. Configurar o backend

```bash
cd backend
npm install
```

### 2.1. Gerar as chaves VAPID (push notifications)

O arquivo `chaves.json` **não é versionado no git** (contém uma chave privada) e precisa ser gerado por cada pessoa que for rodar o projeto.

Gere um novo par de chaves com:

```bash
npx web-push generate-vapid-keys --json
```

Isso vai imprimir algo como:

```json
{"publicKey":"BXXXX...","privateKey":"yyyy..."}
```

Copie o resultado e crie o arquivo `backend/chaves.json` com esse conteúdo, no formato:

```json
{
  "publicKey": "SUA_CHAVE_PUBLICA_AQUI",
  "privateKey": "SUA_CHAVE_PRIVADA_AQUI"
}
```

**Importante**: como você gerou um novo par de chaves, a chave pública mudou. Isso significa que também é necessário atualizar a chave pública usada no frontend (veja a seção 3.1 abaixo). As duas chaves públicas (backend e frontend) precisam ser idênticas, senão as notificações push não vão funcionar.

### 2.2. Configurar variáveis de ambiente

Crie o arquivo `backend/.env`:
JWT_SECRET=escolha-uma-frase-secreta-qualquer-para-desenvolvimento

### 2.3. Rodar o backend

```bash
npm run dev
```

Deve aparecer no terminal:
Servidor rodando na porta 4000
Conexão com banco de dados feita com sucesso

## 3. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

### 3.1. Atualizar a chave pública VAPID

Abra `frontend/src/push.js` e substitua o valor de `VAPID_PUBLIC_KEY` pela **mesma chave pública** gerada no passo 2.1 (a que está em `backend/chaves.json`, campo `publicKey`).

```js
const VAPID_PUBLIC_KEY = "COLE_AQUI_A_MESMA_CHAVE_PUBLICA_DO_BACKEND";
```

### 3.2. (Opcional) Gerar ícones do PWA

Se os ícones em `frontend/public/icons/` não existirem ou estiverem quebrados, gere novos em https://realfavicongenerator.net/ e salve como:

- `frontend/public/icons/icon-192.png` (192x192)
- `frontend/public/icons/icon-512.png` (512x512)

### 3.3. Rodar o frontend

```bash
npm run dev
```

Deve subir em `http://localhost:5173`.

Acesse pelo navegador do computador para conferir se carrega sem erros no console.

## 4. Testar no celular (via ngrok)

PWA exige HTTPS para instalar e para usar câmera/notificações (exceto em `localhost`). Para testar no celular, usamos ngrok para expor o frontend, com um proxy interno redirecionando as chamadas de API para o backend local.

### 4.1. Instalar o ngrok

**Arch Linux:**
```bash
sudo pacman -S ngrok
```

**Outras distros / binário oficial:**
```bash
curl -o ngrok.tgz https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok.tgz
sudo mv ngrok /usr/local/bin/
```

### 4.2. Criar conta e configurar o authtoken

Crie uma conta gratuita em https://dashboard.ngrok.com/signup, copie seu token em https://dashboard.ngrok.com/get-started/your-authtoken e rode:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

Se tiver algum erro, pode comparar com o seguinte `./config/ngrok/ngrok.yml`:
```
version: "2"
authtoken: coloque_seu_token_aqui
tunnels:
  frontend:
    proto: http
    addr: 5173
  backend:
    proto: http
    addr: 4000
```

### 4.3. Rodar o túnel

Com o frontend já rodando (`npm run dev`, porta 5173), em outro terminal:

```bash
ngrok http 5173
```

Vai aparecer algo como:
Forwarding    https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:5173

### 4.4. Liberar o domínio do ngrok no Vite

Na primeira vez, o Vite vai bloquear a requisição vinda do domínio do ngrok. Isso já está resolvido em `frontend/vite.config.js` com:

```js
server: {
  allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

Se o ngrok gerar um domínio de um TLD diferente (ex: `.ngrok.io`), adicione o padrão correspondente nessa lista e reinicie o `npm run dev`.

### 4.5. Acessar pelo celular

Abra a URL HTTPS gerada pelo ngrok que aparecerá no terminal, coloque a ULR no navegador do celular. Deve carregar o app normalmente, com opção de "Adicionar à tela de aplicativos" (essa é a instalação do PWA).

## 5. Fluxo de uso do app

1. Acesse o app, cadastre-se com nome/email/senha
2. Faça login
3. Toque em "Ativar notificações" e conceda a permissão quando solicitado
4. Toque em "Ler QR-Code" e aponte a câmera traseira para um QR-Code
5. O código é cadastrado e vinculado à sua conta
6. A lista de "Meus QR-Codes cadastrados" é atualizada automaticamente

## 6. Testando QR-Codes sem embalagens físicas

Gere QR-Codes de teste em https://www.the-qrcode-generator.com/, com qualquer texto/código como conteúdo (ex: `456`, `789`). Exiba na tela do computador e escaneie com a câmera traseira do celular. O código do QR-Code vai ser o código utilizado ao utilizar a ferramente de CLI

## 7. Disparando o sorteio (CLI de administração)

Quando um QR-Code for sorteado, use o script de linha de comando no backend para notificar o dono:

```bash
cd backend
node manda_msg.js <codigo_do_qrcode> "mensagem da notificação"
```

Exemplo:

```bash
node manda_msg.js 123 'Você foi sorteado!'
```

**Atenção**: se a mensagem contiver o caractere `!`, use aspas simples em vez de aspas duplas, pois `!` dentro de aspas duplas dispara expansão de histórico no bash/zsh:

O script:
- Marca o QR-Code como sorteado no banco de dados
- Se o dono tiver notificações ativadas, envia a notificação push
- Se o dono não tiver notificações ativadas, apenas avisa no terminal. Aparecerá a tela de "Você ganhou" automaticamente na próxima vez que abrir o app


## Solução de problemas comuns

**Erro "Blocked request... not allowed" no Vite**: adicione o domínio do ngrok em `allowedHosts` no `vite.config.js` (veja seção 4.4).

**Câmera não pede permissão / erro `NotAllowedError`**: verifique nas configurações do sistema Android se o Chrome tem permissão de câmera concedida (Configurações > Apps > Chrome > Permissões). É necessário permitir sem perguntar a permissão de utilizar a camêra

**Câmera traseira dá erro `NotReadableError: Could not start video source`**: feche completamente o navegador e outros apps que possam estar usando a câmera, depois tente novamente.

**Notificação não chega**: confirme que o usuário logado ativou notificações (`Notification.requestPermission()` retornou `granted`) e que a subscription foi salva — verifique com:

```bash
mongosh promo-biscoitos --eval "db.users.find({ 'subscription.endpoint': { \$exists: true } }).pretty()"
```

## Resumo final de como rodar o projeto:

### Terminais necessários (rodar simultaneamente)

| Diretório | Comando |
|---|---|
| 1 - `pwa-qrcode-marketing/frontend` | `npm run dev` |
| 2 - `pwa-qrcode-marketing/backend` | `npm run dev` |
| 3 - `pwa-qrcode-marketing/frontend` | `ngrok http 5173` |
| 4 - `pwa-qrcode-marketing/backend` | `node manda_msg.js <codigo_do_qrcode> 'Você foi sorteado na promoção!'` |

> O terminal 4 não fica rodando continuamente — é executado pontualmente sempre que um QR-Code for sorteado.

---

### Verificando o MongoDB

**Iniciar o serviço:**
```bash
sudo systemctl start mongodb
```

**Checar o status:**
```bash
systemctl status mongodb
```

Saída esperada:
```
● mongodb.service - MongoDB Database Server
     Loaded: loaded (/usr/lib/systemd/system/mongodb.service; disabled; preset: disabled)
     Active: active (running) since Fri 2026-07-10 23:01:12 -03; 3s ago
   Main PID: 79547 (mongod)
     Memory: 245.3M (peak: 309.9M)
        CPU: 488ms
     CGroup: /system.slice/mongodb.service
             └─79547 /usr/bin/mongod --config /etc/mongodb.conf
```

**Testar a conexão:**
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

Resposta esperada:
```
{ ok: 1 }
```

---

### Acessando o banco pelo `mongosh`

```bash
mongosh
```

Dentro do shell interativo:

```javascript
show dbs
use promo-biscoitos
show collections
db.users.find().pretty()
db.users.countDocuments()
db.qrcodes.countDocuments()
```

**Consulta direta sem abrir o shell interativo** (útil para verificar um QR-Code específico):

```bash
mongosh promo-biscoitos --eval "db.qrcodes.findOne({ codigo: '2' })"
```