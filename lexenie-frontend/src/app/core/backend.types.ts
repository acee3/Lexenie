
export interface ServerError {
  name: string;
  message: string;
  status: number;
}

export function isServerError(obj: any): obj is ServerError {
  return obj.name && obj.message && obj.status;
}