import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/connectDB.js";

dotenv.config();
connectDB();
const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
