import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useAdminStore = defineStore('admin', () => {
    
    // Mock Transactions (Deposits & Withdrawals)
    const transactions = reactive([
        { id: 101, type: 'DEPOSIT', user: 'Jane Smith', email: 'jane@smith.com', amount: 500, asset: 'USDT', network: 'TRC20', status: 'pending', date: '2023-10-25 10:30' },
        { id: 102, type: 'WITHDRAWAL', user: 'John Doe', email: 'john@doe.com', amount: 1200, asset: 'USDT', network: 'ERC20', status: 'pending', date: '2023-10-25 11:15' },
        { id: 103, type: 'DEPOSIT', user: 'Michael Brown', email: 'mike@trading.com', amount: 5000, asset: 'USDT', network: 'TRC20', status: 'approved', date: '2023-10-24 09:00' },
        { id: 104, type: 'WITHDRAWAL', user: 'Alex Johnson', email: 'alex@crypto.com', amount: 100, asset: 'USDT', network: 'BEP20', status: 'rejected', date: '2023-10-24 14:20' }
    ]);

    // Mock KYC Requests
    const kycRequests = reactive([
        { id: 501, user: 'Jane Smith', email: 'jane@smith.com', status: 'pending', date: '2023-10-25 09:45', documents: { front: 'id_front_mock.jpg', back: 'id_back_mock.jpg' } },
        { id: 502, user: 'New User 01', email: 'new@user.com', status: 'pending', date: '2023-10-26 08:00', documents: { front: 'id_front_mock.jpg', back: 'id_back_mock.jpg' } }
    ]);

    // Actions
    function updateTransactionStatus(id, newStatus) {
        const tx = transactions.find(t => t.id === id);
        if (tx) {
            tx.status = newStatus;
        }
    }

    function updateKYCStatus(id, newStatus) {
        const req = kycRequests.find(k => k.id === id);
        if (req) {
            req.status = newStatus;
        }
    }

    // Getters / Computed logic can be done in components for now

    return {
        transactions,
        kycRequests,
        updateTransactionStatus,
        updateKYCStatus
    };
});
