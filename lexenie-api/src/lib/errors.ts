class DatabaseError extends Error {
  constructor(message: string) {
      super(message);
      this.name = "DatabaseError";
  }
}

class BotResponseError extends Error {
  constructor(message: string) {
      super(message);
      this.name = "BotResponseError";
  }
}

module.exports = { DatabaseError, BotResponseError };