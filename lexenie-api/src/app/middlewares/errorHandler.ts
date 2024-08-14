import { Request, Response, NextFunction } from 'express';
import { BackendError, UnknownError } from '../lib/errors.js';
import { OutputError } from '../lib/types.js';

const handleErrors = async (rawError: any, req: Request, res: Response, next: NextFunction) => {
  const error = rawError instanceof BackendError ? rawError : new UnknownError("Unknown error: " + rawError.stack);
  
  const outputError: OutputError = {
    name: error.name,
    message: error.message,
    status: error.status
  }

  res.status(error.status).json(outputError);
};

export default handleErrors;