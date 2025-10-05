const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração dos serviços a monitorar
const SERVICES = [
    {
        name: 'WhatsApp Bot',
        url: process.env.BOT_URL,
        interval: '*/12 * * * *', // A cada 12 minutos
        timeout: 60000 // 60 segundos
    }
    // Adicione mais serviços aqui se necessário
];

// Estatísticas globais
let stats = {
    startTime: new Date(),
    totalPings: 0,
    successfulPings: 0,
    failedPings: 0,
    lastPing: null,
    services: {}
};

// Inicializa estatísticas por serviço
SERVICES.forEach(service => {
    if (service.url) {
        stats.services[service.name] = {
            totalPings: 0,
            successfulPings: 0,
            failedPings: 0,
            lastPing: null,
            lastResponse: null,
            averageResponseTime: 0,
            status: 'iniciando'
        };
    }
});

// Função para fazer ping em um serviço
async function pingService(service) {
    if (!service.url) {
        console.log(`⚠️  URL não configurada para ${service.name}`);
        return;
    }

    const startTime = Date.now();
    
    try {
        console.log(`📶 Fazendo ping em ${service.name}: ${service.url}`);
        
        const response = await axios.get(service.url, {
            timeout: service.timeout || 60000,
            headers: {
                'User-Agent': 'Keep-Alive-Service/1.0'
            }
        });
        
        const responseTime = Date.now() - startTime;
        const timestamp = new Date();
        
        // Atualiza estatísticas globais
        stats.totalPings++;
        stats.successfulPings++;
        stats.lastPing = timestamp;
        
        // Atualiza estatísticas do serviço
        const serviceStats = stats.services[service.name];
        serviceStats.totalPings++;
        serviceStats.successfulPings++;
        serviceStats.lastPing = timestamp;
        serviceStats.lastResponse = response.status;
        serviceStats.status = 'online';
        
        // Calcula tempo de resposta médio
        if (serviceStats.averageResponseTime === 0) {
            serviceStats.averageResponseTime = responseTime;
        } else {
            serviceStats.averageResponseTime = 
                (serviceStats.averageResponseTime + responseTime) / 2;
        }
        
        console.log(`✅ Ping bem-sucedido para ${service.name} - ${response.status} (${responseTime}ms)`);
        
    } catch (error) {
        const timestamp = new Date();
        
        // Atualiza estatísticas globais
        stats.totalPings++;
        stats.failedPings++;
        stats.lastPing = timestamp;
        
        // Atualiza estatísticas do serviço
        const serviceStats = stats.services[service.name];
        serviceStats.totalPings++;
        serviceStats.failedPings++;
        serviceStats.lastPing = timestamp;
        serviceStats.status = 'offline';
        
        console.error(`❌ Erro ao fazer ping em ${service.name}:`, error.message);
    }
}

// Função para fazer ping em todos os serviços
async function pingAllServices() {
    console.log(`🔄 Executando ping em todos os serviços [${new Date().toLocaleString('pt-BR')}]`);
    
    const promises = SERVICES.map(service => pingService(service));
    await Promise.all(promises);
    
    console.log(`📊 Total: ${stats.totalPings} pings | Sucesso: ${stats.successfulPings} | Falhas: ${stats.failedPings}`);
}

// Configura cron jobs para cada serviço
SERVICES.forEach(service => {
    if (service.url && cron.validate(service.interval)) {
        cron.schedule(service.interval, () => {
            pingService(service);
        }, {
            name: `ping-${service.name}`,
            timezone: "America/Sao_Paulo"
        });
        
        console.log(`⏰ Cron job configurado para ${service.name}: ${service.interval}`);
    } else {
        console.log(`⚠️  Serviço ${service.name} não configurado ou intervalo inválido`);
    }
});

// Middleware
app.use(express.json());

// Endpoint principal com dashboard
app.get('/', (req, res) => {
    const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;
    
    // Calcula taxa de sucesso
    const successRate = stats.totalPings > 0 
        ? Math.round((stats.successfulPings / stats.totalPings) * 100)
        : 0;
    
    const response = {
        status: '🔄 Keep-Alive Service está rodando!',
        uptime: uptimeFormatted,
        timestamp: new Date().toLocaleString('pt-BR'),
        stats: {
            totalPings: stats.totalPings,
            successfulPings: stats.successfulPings,
            failedPings: stats.failedPings,
            successRate: `${successRate}%`,
            lastPing: stats.lastPing
        },
        services: stats.services,
        configuredServices: SERVICES.filter(s => s.url).length,
        endpoints: {
            '/': 'Dashboard completo',
            '/ping-now': 'POST - Ping manual',
            '/stats': 'Apenas estatísticas',
            '/health': 'Health check'
        }
    };
    
    res.json(response);
});

// Endpoint apenas com estatísticas
app.get('/stats', (req, res) => {
    const uptime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
    const successRate = stats.totalPings > 0 
        ? Math.round((stats.successfulPings / stats.totalPings) * 100)
        : 0;
    
    res.json({
        uptime: uptime,
        totalPings: stats.totalPings,
        successfulPings: stats.successfulPings,
        failedPings: stats.failedPings,
        successRate: successRate,
        lastPing: stats.lastPing,
        services: Object.keys(stats.services).length
    });
});

// Health check
app.get('/health', (req, res) => {
    const activeServices = SERVICES.filter(s => s.url).length;
    const onlineServices = Object.values(stats.services)
        .filter(s => s.status === 'online').length;
    
    res.json({
        status: 'online',
        activeServices: activeServices,
        onlineServices: onlineServices,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Endpoint para ping manual
app.post('/ping-now', async (req, res) => {
    try {
        console.log('📲 Ping manual solicitado');
        await pingAllServices();
        
        res.json({
            message: 'Ping manual executado com sucesso!',
            timestamp: new Date().toLocaleString('pt-BR'),
            results: stats.services
        });
    } catch (error) {
        console.error('❌ Erro no ping manual:', error);
        res.status(500).json({
            error: 'Erro ao executar ping manual',
            message: error.message
        });
    }
});

// Ping inicial após 30 segundos (para dar tempo do bot inicializar)
setTimeout(() => {
    console.log('🚀 Executando ping inicial...');
    pingAllServices();
}, 30000);

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Keep-Alive Service rodando na porta ${PORT}`);
    console.log(`📊 Dashboard disponível em: http://localhost:${PORT}`);
    console.log(`🔄 Monitorando ${SERVICES.filter(s => s.url).length} serviço(s)`);
    
    // Lista serviços configurados
    SERVICES.forEach(service => {
        if (service.url) {
            console.log(`• ${service.name}: ${service.url} (${service.interval})`);
        }
    });
});

// Tratamento de erros
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});