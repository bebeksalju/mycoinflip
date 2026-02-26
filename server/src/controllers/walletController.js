const prisma = require('../db');

const getBalance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({ balance: wallet.balance, assets: wallet.assets || {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

const deposit = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;
        const proofFile = req.file;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const proofUrl = proofFile ? `/uploads/proofs/${proofFile.filename}` : null;

        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: parseFloat(amount) } },
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: parseFloat(amount),
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    proofUrl,
                },
            });

            return { wallet, transaction };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Deposit failed' });
    }
};

const withdraw = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, targetAddress } = req.body;

        // KYC check - withdrawal requires approved KYC
        const kyc = await prisma.kyc.findUnique({ where: { userId } });
        if (!kyc || kyc.status !== 'APPROVED') {
            const kycMessage = !kyc
                ? 'Please complete KYC verification before withdrawing funds.'
                : kyc.status === 'PENDING'
                    ? 'Your KYC is still under review. Please wait for approval before withdrawing.'
                    : 'Your KYC was rejected. Please resubmit your documents.';
            return res.status(403).json({ error: kycMessage, kycRequired: true, kycStatus: kyc?.status || 'NONE' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        if (!targetAddress) {
            return res.status(400).json({ error: 'Target wallet address is required' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });

            if (wallet.balance < amount) {
                throw new Error('Insufficient funds');
            }

            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: parseFloat(amount) } },
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: parseFloat(amount),
                    type: 'WITHDRAWAL',
                    status: 'PENDING',
                    targetAddress: targetAddress,
                },
            });

            return { wallet: updatedWallet, transaction };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        if (error.message === 'Insufficient funds') {
            return res.status(400).json({ error: 'Insufficient funds' });
        }
        res.status(500).json({ error: 'Withdrawal failed' });
    }
};

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports = { getBalance, deposit, withdraw, getTransactions };
