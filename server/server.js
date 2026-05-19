import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/connectDB.js";

connectDB();
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
