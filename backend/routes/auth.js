const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


//Route to login
/**
 * @swagger
 * /auth:
 *  post:
 *     summary: User Login
 *     description: login with username and pwd
 *     tags:
 *       - Auth
 *     respsonses:
 *          '201':
 *              descriptions: Login successful
 *          '401':
 *              descriptions: Unable to login
 *             
 
 */
router.post('/', authController.handleLogin);

module.exports = router;