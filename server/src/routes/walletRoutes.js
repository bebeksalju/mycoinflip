const express = require('express');
const multer = require('multer');
const path = require('path');
const { getBalance, deposit, withdraw, getTransactions } = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config for proof uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/proofs'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `proof-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticateToken);

router.get('/', getBalance);
router.post('/deposit', upload.single('proof'), deposit);
router.post('/withdraw', withdraw);
router.get('/transactions', getTransactions);

module.exports = router;
