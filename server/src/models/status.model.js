import mongoose from "mongoose";
import statusSchema from "../schema/status.schema.js";

const Status = mongoose.model("Status", statusSchema);

export default Status;
