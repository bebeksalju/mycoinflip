const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let token = '';

async function run() {
    try {
        console.log('1. Registering/Logging in...');
        try {
            const reg = await axios.post(`${API_URL}/auth/register`, {
                email: 'trader@example.com',
                password: 'password123',
                name: 'Trader Joe' 
            });
            token = reg.data.token;
        } catch (e) {
            const login = await axios.post(`${API_URL}/auth/login`, {
                email: 'trader@example.com',
                password: 'password123'
            });
            token = login.data.token;
        }
        console.log('   Token acquired.');

        console.log('2. Depositing 1000 USDT...');
        await axios.post(`${API_URL}/wallet/deposit`, { amount: 1000 }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Deposit success.');

        console.log('3. Buying 0.1 BTC at $50,000...');
        const buy = await axios.post(`${API_URL}/trade`, {
            type: 'buy',
            coinSymbol: 'BTC',
            amount: 0.1,
            price: 50000,
            total: 5000 // 0.1 * 50000
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        console.log('   Buy Result:', buy.data.success);
        console.log('   Wallet Assets:', buy.data.wallet.assets);

        console.log('4. Selling 0.05 BTC at $60,000...');
        const sell = await axios.post(`${API_URL}/trade`, {
            type: 'sell',
            coinSymbol: 'BTC',
            amount: 0.05,
            price: 60000,
            total: 3000 // 0.05 * 60000
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log('   Sell Result:', sell.data.success);
        console.log('   Wallet Assets:', sell.data.wallet.assets);
        console.log('   Wallet Balance:', sell.data.wallet.balance);

        console.log('✅ Trade Flow Verified!');

    } catch (error) {
        console.error('❌ Verification Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

run();
