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

class AudioChunkSentBeforeStartRecordingError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "AudioChunkSentBeforeStartRecordingError";
    this.status = status;
  }
}

class AudioNotRecordedError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "AudioNotRecordedError";
    this.status = status;
  }
}

class DeletedFileDoesNotExistError extends BackendError {
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "DeletedFileDoesNotExistError";
    this.status = status;
  }
}

class UnauthorizedError extends BackendError {
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "CredentialError";
    this.status = status;
  }
}

class ConflictError extends BackendError {
  constructor(message: string, status: number = 409) {
    super(message);
    this.name = "ConflictError";
    this.status = status;
  }
}

class NotFoundError extends BackendError {
  constructor(message: string, status: number = 404) {
    super(message);
    this.name = "NotFoundError";
    this.status = status;
  }
}

class UnknownError extends BackendError {
  constructor(message: string = "An unknown error occurred.", status: number = 500) {
    super(message);
    this.name = "UnknownError";
    this.status = status;
  }
}

export { SetupError, BackendError, BotResponseError, QueryError, WebsocketNotConnectError, AudioChunkSentBeforeStartRecordingError, AudioNotRecordedError, DeletedFileDoesNotExistError, UnauthorizedError, ConflictError, NotFoundError, UnknownError };