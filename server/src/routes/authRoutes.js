const express = require('express');
const multer = require('multer');
const path = require('path');
const { register, login, submitKyc } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer config for KYC uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/kyc'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `kyc-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/register', register);
router.post('/login', login);
router.post('/kyc', authenticateToken, upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 }
]), submitKyc);

module.exports = router;
