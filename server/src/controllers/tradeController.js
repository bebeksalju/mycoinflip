const prisma = require('../db');

const executeTrade = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, coinSymbol, amount, price, total } = req.body;

        // Validation
        if (!type || !coinSymbol || !amount || !price || !total) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const symbolKey = coinSymbol.toLowerCase();

        // Transaction for Atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (!wallet) throw new Error('Wallet not found');

            let newBalance = wallet.balance;
            let newAssets = wallet.assets || {}; // Ensure it's an object

            // 2. Logic based on Type
            if (type.toUpperCase() === 'BUY') {
                // Check USDT Balance
                if (wallet.balance < total) {
                    throw new Error('Insufficient USDT Balance');
                }

                // Deduct USDT
                newBalance -= parseFloat(total);

                // Add Coin
                const currentCoinBalance = parseFloat(newAssets[symbolKey] || 0);
                newAssets[symbolKey] = currentCoinBalance + parseFloat(amount);

            } else if (type.toUpperCase() === 'SELL') {
                // Check Coin Balance
                const currentCoinBalance = parseFloat(newAssets[symbolKey] || 0);
                if (currentCoinBalance < amount) {
                    throw new Error(`Insufficient ${coinSymbol} Balance`);
                }

                // Deduct Coin
                newAssets[symbolKey] = currentCoinBalance - parseFloat(amount);

                // Add USDT
                newBalance += parseFloat(total);

            } else {
                throw new Error('Invalid Trade Type');
            }

            // 3. Update Wallet
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: {
                    balance: newBalance,
                    assets: newAssets,
                },
            });

            // 4. Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    type: type.toUpperCase() === 'BUY' ? 'TRADE_BUY' : 'TRADE_SELL',
                    amount: parseFloat(amount),
                    price: parseFloat(price),
                    coinSymbol: coinSymbol.toUpperCase(),
                    status: 'COMPLETED',
                },
            });

            return { wallet: updatedWallet, transaction };
            });

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Trade Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

const settleGame = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { result, amount, profit, pair, durationSeconds } = req.body;

        if (!['win', 'loss'].includes(result) || !amount || !pair) {
            return res.status(400).json({ error: 'Invalid settlement data' });
        }

        const dbResult = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet & User profitMode
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new Error('Wallet not found');

            const user = await tx.user.findUnique({ where: { id: userId }, select: { profitMode: true } });

            // Look up duration percentage from DB
            let percentage = 80; // default fallback
            if (durationSeconds) {
                const duration = await tx.tradingDuration.findUnique({ where: { seconds: parseInt(durationSeconds) } });
                if (duration) percentage = duration.percentage;
            }

            // SERVER-SIDE PROFIT MODE OVERRIDE
            let finalResult = result;
            if (user?.profitMode === 'win') {
                finalResult = 'win';
            } else if (user?.profitMode === 'loss') {
                finalResult = 'loss';
            }

            let newBalance = wallet.balance;
            let actualProfit = parseFloat(amount) * (percentage / 100);

            if (finalResult === 'loss') {
                actualProfit = 0;
            }
            
            if (finalResult === 'win') {
                newBalance += actualProfit; 
            } else {
                newBalance -= parseFloat(amount);
            }
            
            // Check for negative balance
            if (newBalance < 0) newBalance = 0;

            // 3. Update Wallet
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            });

            // 4. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    type: finalResult === 'win' ? 'TRADE_WIN' : 'TRADE_LOSS',
                    amount: parseFloat(amount), 
                    price: 0, // Not applicable
                    coinSymbol: pair,
                    status: 'COMPLETED',
                },
            });
            
            return { wallet: updatedWallet, transaction };
        });

        res.json({ success: true, ...dbResult });

    } catch (error) {
        console.error('Settlement Error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const wins = await prisma.transaction.count({
            where: { userId, type: 'TRADE_WIN' }
        });

        const losses = await prisma.transaction.count({
            where: { userId, type: 'TRADE_LOSS' }
        });

        // Calculate Net Profit from actual transactions
        // WIN: profit = amount * 0.8 (80% payout)
        // LOSS: loss = -amount
        const winTxs = await prisma.transaction.findMany({
            where: { userId, type: 'TRADE_WIN' },
            select: { amount: true }
        });
        const lossTxs = await prisma.transaction.findMany({
            where: { userId, type: 'TRADE_LOSS' },
            select: { amount: true }
        });

        const totalWinProfit = winTxs.reduce((sum, tx) => sum + (tx.amount * 0.8), 0);
        const totalLossAmount = lossTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const netProfit = totalWinProfit - totalLossAmount;

        res.json({ 
            wins, 
            losses, 
            netProfit: parseFloat(netProfit.toFixed(2)),
            totalTrades: wins + losses 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Platform-wide statistics
const getAdminStats = async (req, res) => {
    try {
        // Total Users (Excludes ADMIN/SUPERUSER)
        const totalUsers = await prisma.user.count({
            where: { role: 'USER' }
        });

        // Total Deposits (sum of completed deposit amounts)
        const deposits = await prisma.transaction.findMany({
            where: { type: 'DEPOSIT', status: 'COMPLETED' },
            select: { amount: true }
        });
        const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);

        // Pending Withdrawals
        const pendingWithdrawals = await prisma.transaction.count({
            where: { type: 'WITHDRAWAL', status: 'PENDING' }
        });

        // Pending KYC
        const pendingKyc = await prisma.kyc.count({
            where: { status: 'PENDING' }
        });

        // Recent Transactions (last 10)
        const recentActivity = await prisma.transaction.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true, name: true } }
            }
        });

        // Total Trades
        const totalTrades = await prisma.transaction.count({
            where: { type: { in: ['TRADE_BUY', 'TRADE_SELL', 'TRADE_WIN', 'TRADE_LOSS'] } }
        });

        res.json({
            totalUsers,
            totalDeposits: parseFloat(totalDeposits.toFixed(2)),
            pendingWithdrawals,
            pendingKyc,
            totalTrades,
            recentActivity: recentActivity.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                status: tx.status,
                userEmail: tx.user.email,
                userName: tx.user.name,
                createdAt: tx.createdAt
            }))
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    executeTrade,
    settleGame,
    getStats,
    getAdminStats
};
