# 🚀 Deploy na Vercel

Este projeto está configurado para deploy automático na **Vercel** como aplicação web mobile.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório no GitHub conectado

## 🔧 Configuração Local

### 1. Instalar dependências
```bash
npm install
```

### 2. Testar localmente na web
```bash
npm run web
```

### 3. Build para produção
```bash
npm run build:web
```

Isso irá gerar os arquivos estáticos no diretório `dist/`.

### 4. Preview local do build
```bash
npm run preview:web
```

## 🌐 Deploy na Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project"
4. Importe o repositório
5. A Vercel detectará automaticamente as configurações do `vercel.json`
6. Clique em "Deploy"

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login na Vercel
vercel login

# Deploy de produção
npm run deploy
```

## ⚙️ Configurações da Vercel

O arquivo `vercel.json` já está configurado com:

- ✅ **Build Command**: `npx expo export -p web`
- ✅ **Output Directory**: `dist`
- ✅ **Framework**: null (configuração manual)
- ✅ **Headers de Segurança**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- ✅ **Cache de Assets**: Cache público de 1 ano para arquivos estáticos
- ✅ **SPA Routing**: Rewrite de todas as rotas para index.html

## 📱 Otimizações para Mobile Web

O projeto já inclui:

- ✅ Meta tags otimizadas para mobile (viewport, PWA)
- ✅ Suporte a dark/light mode
- ✅ Haptics desabilitado na web (não disponível)
- ✅ HTML customizado com otimizações de performance
- ✅ Smooth scrolling
- ✅ Prevenção de ajuste de texto em mobile
- ✅ Remoção de tap highlight

## 🔍 Variáveis de Ambiente

Se precisar de variáveis de ambiente:

1. Crie um arquivo `.env.local`
2. Adicione suas variáveis:
```bash
EXPO_PUBLIC_API_URL=https://api.example.com
```
3. Configure as mesmas variáveis no painel da Vercel em:
   **Settings → Environment Variables**

## 📊 Monitoramento

Após o deploy, você pode:

- Ver logs em tempo real no dashboard da Vercel
- Configurar domínio customizado
- Habilitar Analytics da Vercel
- Configurar notificações de deploy

## 🐛 Troubleshooting

### Build falhou?
- Verifique se `npm run build:web` funciona localmente
- Confira os logs de build no dashboard da Vercel
- Certifique-se de que todas as dependências estão no `package.json`

### Rotas não funcionam?
- O `vercel.json` já está configurado com rewrites para SPA
- Todas as rotas redirecionam para `/index.html`

### Assets não carregam?
- Verifique se os caminhos das imagens estão corretos
- Use caminhos relativos ou absolutos a partir de `/`

## 🔗 Links Úteis

- [Documentação Expo Web](https://docs.expo.dev/workflow/web/)
- [Documentação Vercel](https://vercel.com/docs)
- [Deploy Expo na Vercel](https://docs.expo.dev/distribution/publishing-websites/)
