import path from 'node:path';
import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'StitchLog API',
      version: '1.0.0',
      description: 'API para gerenciamento de receitas de crochê.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || '3000'}`,
        description: 'Servidor local',
      },
    ],
    paths: {
      '/api/recipes': {
        post: {
          tags: ['Recipes'],
          summary: 'Cadastra uma receita',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecipeInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Receita criada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Recipe' },
                },
              },
            },
            400: {
              description: 'Dados da receita inválidos.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Autenticação obrigatória.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Categoria não encontrada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/recipes/{id}': {
        get: {
          tags: ['Recipes'],
          summary: 'Consulta uma receita pelo ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID inteiro positivo da receita.',
              schema: { type: 'integer', format: 'int32', minimum: 1, maximum: 2147483647 },
            },
          ],
          responses: {
            200: {
              description: 'Receita encontrada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Recipe' },
                },
              },
            },
            400: {
              description: 'ID de receita inválido.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Receita não encontrada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        put: {
          tags: ['Recipes'],
          summary: 'Atualiza uma receita do usuário autenticado',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID inteiro positivo da receita.',
              schema: { type: 'integer', format: 'int32', minimum: 1, maximum: 2147483647 },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecipeInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Receita atualizada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Recipe' },
                },
              },
            },
            400: {
              description: 'ID ou dados da receita inválidos.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Autenticação obrigatória.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'A receita pertence a outro usuário.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Receita ou categoria não encontrada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        delete: {
          tags: ['Recipes'],
          summary: 'Exclui uma receita do usuário autenticado',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID inteiro positivo da receita.',
              schema: { type: 'integer', format: 'int32', minimum: 1, maximum: 2147483647 },
            },
          ],
          responses: {
            204: {
              description: 'Receita excluída.',
            },
            400: {
              description: 'ID de receita inválido.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Autenticação obrigatória.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'A receita pertence a outro usuário.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Receita não encontrada.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            500: {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Informe somente o JWT retornado pelo endpoint de login.',
        },
      },
      responses: {
        InternalServerError: {
          description: 'Erro interno inesperado no servidor.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
      schemas: {
        RecipeInput: {
          type: 'object',
          required: ['title', 'difficulty', 'categoryId'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              pattern: '.*\\S.*',
              example: 'Amigurumi de coelho',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Receita de amigurumi para iniciantes.',
            },
            difficulty: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              pattern: '.*\\S.*',
              example: 'Fácil',
            },
            categoryId: {
              type: 'integer',
              format: 'int32',
              minimum: 1,
              maximum: 2147483647,
              example: 1,
            },
          },
        },
        Recipe: {
          type: 'object',
          required: [
            'id',
            'title',
            'description',
            'difficulty',
            'category',
            'creator_name',
            'created_at',
          ],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Amigurumi de coelho' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Receita de amigurumi para iniciantes.',
            },
            difficulty: { type: 'string', example: 'Fácil' },
            category: { type: 'string', example: 'Amigurumi' },
            creator_name: { type: 'string', example: 'Taisa' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'taisa@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 1,
              example: 'stitchlog123',
            },
          },
        },
        PublicUser: {
          type: 'object',
          required: ['id', 'name', 'email', 'created_at'],
          properties: {
            id: { type: 'integer', format: 'int32', example: 1 },
            name: { type: 'string', example: 'Taisa' },
            email: { type: 'string', format: 'email', example: 'taisa@example.com' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        LoginResponse: {
          type: 'object',
          required: ['token', 'user'],
          properties: {
            token: {
              type: 'string',
              description: 'JWT usado no esquema bearerAuth.',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: { $ref: '#/components/schemas/PublicUser' },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: { type: 'string', example: 'RECIPE_NOT_FOUND' },
                message: { type: 'string', example: 'Receita não encontrada.' },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, '../src/**/*.routes.{ts,js}')],
};

export const swaggerDocument = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
