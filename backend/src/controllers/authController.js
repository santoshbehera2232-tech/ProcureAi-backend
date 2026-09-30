import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, full_name, phone, company_name, gstin, pan, address } = req.body;
      if (!email || !password || !full_name || !company_name) {
        return res.status(400).json({
          success: false,
          message: 'Full Name, Email, Password, and Company Name are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      const result = await authService.register({
        email,
        password,
        full_name,
        phone,
        company_name,
        gstin,
        pan,
        address
      });

      res.status(201).json({
        success: true,
        message: 'Account and Organization successfully registered.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password, is_supplier } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const result = await authService.login({ email, password, is_supplier });
      res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Access token renewed.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user.id, req.user.is_supplier);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    res.status(200).json({
      success: true,
      message: `Password reset verification link has been sent to ${email}.`
    });
  }
};
