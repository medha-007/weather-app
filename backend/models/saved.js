const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema({
  uid: String,

  city: String,

  savedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Save", saveSchema);

