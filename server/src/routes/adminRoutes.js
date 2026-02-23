const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/balance', adminController.updateUserBalance);
router.put('/users/:id/profit-mode', adminController.updateUserProfitMode);
router.put('/users/:id/ban', adminController.toggleUserBan);

// Finance (Transactions)
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/status', adminController.updateTransactionStatus);

// KYC
router.get('/kyc', adminController.getKycRequests);
router.put('/kyc/:id/status', adminController.updateKycStatus);

// Admin Profile
router.put('/password', adminController.changePassword);

// Admin Management
router.get('/admins', adminController.getAdmins);
router.post('/admins', adminController.createAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

// Admin Wallet (deposit addresses)
router.get('/wallets', adminController.getWallets);
router.put('/wallets', adminController.updateWallets);
router.get('/wallets/public', adminController.getPublicWallets);

// Trading Durations
router.get('/durations', adminController.getDurations);
router.post('/durations', adminController.addDuration);
router.delete('/durations/:id', adminController.deleteDuration);
router.get('/durations/public', adminController.getPublicDurations);

module.exports = router;
