const Listing = require("../models/listing");
const nodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};

const geoCoder = nodeGeocoder(options);

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    // throw new ExpressError(404, "Listing not found");
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
    //return;
  }
  let location = { lat: 17.4065, lng: 78.4772 }; // Default to Hyderabad
  try {
    const locationData = await geoCoder.geocode(listing.location + ', ' + listing.country);
    if (locationData && locationData.length > 0) {
      location = {
        lat: locationData[0].latitude,
        lng: locationData[0].longitude
      };
    }
  } catch (err) {
    console.log("Geocoding error:", err);
  }
  //console.log("Final location:", location);
  //console.log(listing);
  res.render("listings/show.ejs", { listing, location });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    // throw new ExpressError(404, "Listing not found");
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
    return;
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deletedListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found");
  }
  req.flash("success", "Listing Deleted!");
  //console.log(deletedListing);
  res.redirect("/listings");
};
