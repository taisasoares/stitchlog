import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `A rota [${req.method}] ${req.url} não existe :c`
    }
  });
}