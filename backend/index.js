//part 4 changes
const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");

// const errorHandler = (error, request, response, next) => {
//   console.error(error.name, error.message);

//   if (error.name === "CastError") {
//     return response.status(400).json({ error: "malformatted id" });
//   } else if (error.name === "ValidationError") {
//     const details = Object.fromEntries(
//       Object.entries(error.errors).map(([field, err]) => [field, err.message])
//     );
//     return response.status(400).json({
//       error: "validation error",
//       details,
//     });
//   }

//   response.status(500).json({ error: "internal server error" });
// };

// app.use(errorHandler);

// added the environment variable below
const PORT = config.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`);
});
