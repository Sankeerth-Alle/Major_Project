const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// const imageSchema = new Schema({
//     filename: String,
//     url: {
//         type: String,
//         default: "https://unsplash.com/photos/a-serene-green-valley-is-surrounded-by-trees-5ycFuf6Gp0I",
//         set: (v) => v === "" ? "https://unsplash.com/photos/a-serene-green-valley-is-surrounded-by-trees-5ycFuf6Gp0I" : v,
//     }
// }, { _id: false });

const listingSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  description: String,
  image: {
      url : String,
      filename : String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  category: {
    type: String,
    enum: ["desserts", "rooms", "castles", "pools", "boats", "artic", "domes", "mountains", "camping", "farms"],
    required: true,
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
