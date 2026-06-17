const mongoose = require("mongoose");

const SearchSchema = new mongoose.Schema({
  uid: String,

  city: String,

  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Search", SearchSchema);