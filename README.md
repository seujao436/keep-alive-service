# 🔄 Keep-Alive Service para Render

Serviço automatizado que mantém seus projetos no Render sempre ativos, evitando que durmam após 15 minutos de inatividade.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/seujao436/keep-alive-service)

## ✨ Recursos

- ⏰ Ping automático a cada 12 minutos
- 📊 Dashboard com estatísticas em tempo real
- 🔄 Suporta múltiplos serviços simultaneamente
- 📈 Tracking de uptime e response time
- 🎯 Ping manual via API
- 💯 **100% GRATUITO** no Render FREE
- 🆓 Funciona perfeitamente no plano FREE

## 🚀 Deploy Rápido

### Opção 1: Deploy Automático (Recomendado)

1. **Primeiro**, faça deploy do seu [bot WhatsApp](https://github.com/seujao436/whatsapp-gemini-bot)
2. Clique no botão **Deploy to Render** acima
3. Configure a variável de ambiente:
   - `BOT_URL`: URL do seu bot (ex: `https://seu-bot.onrender.com/ping`)
4. Clique em **Apply**
5. Pronto! Seus serviços ficarão sempre ativos 🎉

### Opção 2: Deploy Manual

```bash
# 1. Clone o repositório
git clone https://github.com/seujao436/keep-alive-service.git
cd keep-alive-service

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e adicione a BOT_URL

# 4. Execute localmente
npm start
```

## ❗ IMPORTANTE - Plano FREE do Render

### 🎯 Por que usar o Keep-Alive Service?

- **⏰ Sleep Mode**: Render FREE dorme após 15 min de inatividade
- **💯 Solução**: Este serviço faz ping a cada 12 minutos
- **🎯 Resultado**: Seus bots ficam sempre ativos
- **💰 Custo**: 100% gratuito no plano FREE
- **🕑 Limite**: 750h/mês (suficiente para 1 serviço 24/7)

### 📊 Cálculo de Horas:

- **1 serviço ativo**: ~720h/mês ✅ (dentro do limite)
- **2 serviços ativos**: ~1440h/mês ❌ (excede limite)
- **Solução**: Use UptimeRobot externo para múltiplos serviços

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `BOT_URL` | URL do serviço a manter ativo | `https://meu-bot.onrender.com/ping` | ✅ Sim |
| `PORT` | Porta do servidor (padrão: 3000) | `3000` | ❌ Não |

### Adicionar Mais Serviços

Edite o arquivo `keepalive.js` e adicione ao array `SERVICES`:

```javascript
const SERVICES = [
    {
        name: 'WhatsApp Bot',
        url: process.env.BOT_URL,
        interval: '*/12 * * * *' // A cada 12 minutos
    },
    {
        name: 'Outro Serviço',
        url: 'https://outro-servico.onrender.com/ping',
        interval: '*/10 * * * *' // A cada 10 minutos
    }
];
```

## 📊 Dashboard e API

### Visualizar Estatísticas

Acesse a URL do seu keep-alive service para ver:

```
https://seu-keep-alive.onrender.com/
```

**Resposta JSON:**

```json
{
  "status": "online",
  "uptime": "5h 32m",
  "timestamp": "05/10/2025, 20:43:00",
  "stats": {
    "totalPings": 127,
    "successfulPings": 126,
    "failedPings": 1
  }
}
```

### Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Dashboard com estatísticas completas |
| `/ping-now` | POST | Força ping manual imediato |
| `/stats` | GET | Apenas estatísticas |
| `/health` | GET | Health check do serviço |

### Ping Manual

```bash
curl -X POST https://seu-keep-alive.onrender.com/ping-now
```

## 🛠️ Tecnologias

- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [node-cron](https://www.npmjs.com/package/node-cron) - Agendamento de tarefas
- [Axios](https://axios-http.com/) - Cliente HTTP
- [Express](https://expressjs.com/) - Framework web
- [Render](https://render.com/) - Hospedagem cloud (FREE)

## ⏱️ Intervalos de Ping

### Intervalos Recomendados

| Serviço | Intervalo | Formato Cron | Horas/Mês |
|---------|-----------|--------------|-----------|
| **Padrão** | 12 minutos | `*/12 * * * *` | ~720h |
| Econômico | 14 minutos | `*/14 * * * *` | ~720h |
| Agressivo | 10 minutos | `*/10 * * * *` | ~720h |

### Sintaxe Cron

```
┌────────────── minuto (0 - 59)
│ ┌──────────── hora (0 - 23)
│ │ ┌────────── dia do mês (1 - 31)
│ │ │ ┌──────── mês (1 - 12)
│ │ │ │ ┌────── dia da semana (0 - 6)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Exemplos:**
- `*/12 * * * *` - A cada 12 minutos
- `0 */2 * * *` - A cada 2 horas
- `0 9 * * *` - Todos os dias às 9h

## 📈 Monitoramento

### Estatísticas em Tempo Real

O dashboard mostra:

- ✅ **Total de pings**: Quantidade total enviada
- 📊 **Taxa de sucesso**: Percentual de pings bem-sucedidos
- ⏱️ **Último ping**: Timestamp do último ping
- 🎯 **Status**: Estado atual de cada serviço
- ⚡ **Response time**: Tempo de resposta médio

### Logs

Visualize logs em tempo real no Render:

```bash
# Via CLI do Render
render logs -f -s keep-alive-service

# Ou no Dashboard do Render
# Dashboard > Seu Serviço > Logs
```

## 🐛 Solução de Problemas

### Serviço ainda dorme

- ✅ Confirme que a `BOT_URL` está correta
- ✅ Verifique se o endpoint `/ping` responde
- ✅ Reduza o intervalo para 10 minutos
- ✅ Verifique logs para erros

### Muitos pings falhando

- ✅ Verifique se o bot está online
- ✅ Confirme que o endpoint está correto
- ✅ Aumente o timeout no código (padrão: 60s)

### Limite de horas do Render

O plano gratuito oferece **750 horas/mês**:
- Com 1 serviço ativo 24/7 = ~720h/mês ✅
- Com 2 serviços = ~1440h/mês ❌ (excede)

**Solução**: Use UptimeRobot externo para manter ambos ativos

### Bot ainda precisa reautenticar

- ✅ **Normal**: Keep-alive evita sleep, não evita restart
- ✅ Restarts são raros (deploy, falha do sistema)
- ✅ Monitore via [dashboard do bot](https://github.com/seujao436/whatsapp-gemini-bot)

## 💡 Dicas e Otimizações

### Otimizar Custos

1. **Use intervalos de 12-14 minutos** (evita excesso de requests)
2. **Monitore apenas serviços essenciais**
3. **Configure `autoDeploy: false`** no render.yaml se necessário

### Melhorar Confiabilidade

1. **Adicione retry logic** para pings falhados
2. **Configure notificações** via webhook
3. **Use múltiplos keep-alives** para redundância

### Alternativas Complementares

- [UptimeRobot](https://uptimerobot.com/) - Gratuito, 50 monitores
- [Cron-job.org](https://cron-job.org/) - Cron jobs externos
- [Render Cron Jobs](https://render.com/docs/cronjobs) - Pago, $1/mês

## 🏠 Estrutura do Projeto

```
keep-alive-service/
├── keepalive.js     # Arquivo principal
├── package.json     # Dependências
├── render.yaml      # Config do Render (FREE)
├── .env.example     # Exemplo de variáveis
├── .gitignore       # Arquivos ignorados
└── README.md        # Este arquivo
```

## 🔄 Como Usar Juntos

### Passo a Passo Completo:

1. **Deploy Bot WhatsApp**:
   - Acesse: [whatsapp-gemini-bot](https://github.com/seujao436/whatsapp-gemini-bot)
   - Clique "Deploy to Render"
   - Configure `GEMINI_API_KEY`
   - Copie a URL gerada

2. **Deploy Keep-Alive**:
   - Acesse: [keep-alive-service](https://github.com/seujao436/keep-alive-service)
   - Clique "Deploy to Render"
   - Configure `BOT_URL` com: `https://seu-bot.onrender.com/ping`

3. **Resultado**:
   - Bot fica sempre ativo (sem sleep)
   - Reautenticação apenas em restarts (raros)
   - 100% gratuito dentro do limite de 750h/mês

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🌟 Projetos Relacionados

- [Bot WhatsApp + Gemini](https://github.com/seujao436/whatsapp-gemini-bot) - Bot de WhatsApp com IA
- [UptimeRobot](https://uptimerobot.com/) - Alternativa de monitoramento
- [TabNews](https://tabnews.com.br/) - Comunidade brasileira de tecnologia

## 📞 Suporte

- 🐛 Issues: [GitHub Issues](https://github.com/seujao436/keep-alive-service/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seujao436/keep-alive-service/discussions)
- 📧 Email: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

---

**⭐ Mantenha seus projetos sempre ativos com este serviço!**

**🆓 100% GRATUITO no plano FREE do Render!**

**💡 Dica:** Deploy o keep-alive **depois** do bot para já ter a URL correta.