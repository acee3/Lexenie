abstract class BackendError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

class SetupError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "SetupError";
    this.status = status;
  }
}

class BotResponseError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "BotResponseError";
    this.status = status;
  }
}

class QueryError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "QueryError";
    this.status = status;
  }
}

class WebsocketNotConnectError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "WebsocketNotConnectError";
    this.status = status;
  }
}

class UnknownError extends BackendError {
  constructor(status: number = 500) {
    super("An unknown error occurred.");
    this.name = "UnknownError";
    this.status = status;
  }
}

export { SetupError, BackendError, BotResponseError, QueryError, WebsocketNotConnectError, UnknownError };