import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Autentica um usuário
 *     description: Retorna um JWT que pode ser informado no botão Authorize do Swagger UI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: E-mail ou senha não foram informados corretamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciais inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/login', controller.login);

export default router;
