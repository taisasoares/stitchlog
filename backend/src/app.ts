import 'dotenv/config';
import express from 'express';
import { loadConfig } from './config';
import authRoutes from './auth/auth.routes';
import categoryRoutes from './categories/categories.routes';
import executionRoutes from './executions/executions.routes';
import materialRoutes from './materials/materials.routes';
import recipeRoutes from './recipes/recipes.routes';
import stepRoutes from './steps/steps.routes';
import tagRoutes from './tags/tags.routes';
import userRoutes from './users/users.routes';
import { errorHandler } from './errors/errorHandler';
import { notFoundHandler } from './errors/notFoundHandler';

const config = loadConfig();
const app = express();

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', recipeRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', materialRoutes);
app.use('/api', stepRoutes);
app.use('/api', executionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🧶 Servidor StitchLog rodando com sucesso na porta ${config.port}`);
});
