export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'StitchLog API',
    version: '1.0.0',
    description: 'API para gerenciamento de receitas de crochê.',
  },
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
      },
    },
    schemas: {
      RecipeInput: {
        type: 'object',
        required: ['title', 'difficulty', 'categoryId'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, pattern: '.*\\S.*' },
          description: { type: 'string', nullable: true },
          difficulty: { type: 'string', minLength: 1, maxLength: 50, pattern: '.*\\S.*' },
          categoryId: {
            type: 'integer',
            format: 'int32',
            minimum: 1,
            maximum: 2147483647,
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
};
