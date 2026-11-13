import app from "./src/app.js";
import { config } from "./src/config/config.js";
import { connectDB } from "./src/config/database.config.js";

const port = config.PORT

connectDB()
.then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
  })
})
.catch(error => {
  console.log(`DB connection failed! error: ${error}`)
  process.exit(1)
})