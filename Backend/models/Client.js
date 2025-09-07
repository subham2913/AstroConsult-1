const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    birthTime: { type: String, required: true },
    birthPlace: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    fatherName: String,
    motherName: String,
    grandfatherName: String,
    address: String,
    pincode: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
