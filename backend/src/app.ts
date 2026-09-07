import 'dotenv/config';
import express from 'express';
import { loadConfig } from './config';
import recipeRoutes from './recipes/recipes.routes';
import { errorHandler } from './errors/errorHandler';
import { notFoundHandler } from './errors/notFoundHandler';

const config = loadConfig();
const app = express();

app.use(express.json());

app.use('/api', recipeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🧶 Servidor StitchLog rodando com sucesso na porta ${config.port}`);
});