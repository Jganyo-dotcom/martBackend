// src/middlewares/logger.js
const chalk = require("chalk"); // CommonJS import

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  console.log(
    chalk.blue("[REQUEST]"),
    chalk.green(req.method),
    chalk.yellow(req.originalUrl),
    chalk.magenta(`User-Agent: ${req.headers["user-agent"]}`),
  );

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? chalk.red
        : res.statusCode >= 400
          ? chalk.yellow
          : chalk.green;

    console.log(
      chalk.blue("[RESPONSE]"),
      statusColor(String(res.statusCode)), // ✅ pass string
      chalk.cyan(`${duration}ms`),
      chalk.gray(`Content-Length: ${res.get("Content-Length") || 0}`),
    );
  });

  next();
};

module.exports = loggerMiddleware;
