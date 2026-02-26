const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and wallet
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        wallet: {
          create: {
            balance: 0.0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { kyc: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        error: 'Your account has been suspended. Please contact customer support.',
        banned: true
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const submitKyc = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if KYC already exists
    const existing = await prisma.kyc.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ error: 'KYC already submitted' });
    }

    const frontFile = req.files?.front?.[0];
    const backFile = req.files?.back?.[0];

    const kyc = await prisma.kyc.create({
      data: {
        userId,
        status: 'PENDING',
        fullName: req.body.fullName || null,
        idNumber: req.body.idNumber || null,
        documentUrl: frontFile ? `/uploads/kyc/${frontFile.filename}` : null,
        documentUrlBack: backFile ? `/uploads/kyc/${backFile.filename}` : null,
      }
    });

    res.status(201).json({ success: true, kyc });
  } catch (error) {
    console.error('KYC submit error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { register, login, submitKyc };
