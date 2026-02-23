const WebSocket = require('ws');

class MarketService {
    constructor(io) {
        this.io = io;
        this.ws = null;
        this.reconnectInterval = 3000;
        this.supportedCoins = [
            'btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt',
            'dogeusdt', 'adausdt', 'avaxusdt', 'dotusdt', 'linkusdt'
        ];
    }

    connect() {
        const streams = this.supportedCoins.map(pair => `${pair}@aggTrade`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

        console.log('Connecting to Binance WS:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
            console.log('Connected to Binance WebSocket');
        });

        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message.data) {
                    // Broadcast to all connected clients
                    this.io.emit('market:update', message.data);
                }
            } catch (error) {
                console.error('Error parsing WS message:', error);
            }
        });

        this.ws.on('close', () => {
            console.log('Binance WS closed. Reconnecting...');
            setTimeout(() => this.connect(), this.reconnectInterval);
        });

        this.ws.on('error', (error) => {
            console.error('Binance WS Error:', error);
            this.ws.close();
        });
    }
}

module.exports = MarketService;
