import { Router } from 'express';

const router = Router();

// Simple test routes without any middleware or complex logic
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test auth endpoint'
  });
});

export default router;
