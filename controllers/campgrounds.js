const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const allCampgrounds = await Campground.find();

  res.render("campgrounds/index", { campgrounds: allCampgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.body.features[0].geometry;

  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();
  req.flash("success", "Campground created succesfully");
  res.redirect(`/campgrounds/${newCampground._id}`);
};
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  if (!campground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};
module.exports.renderEditForm = async (req, res) => {
  const foundCampground = await Campground.findById(req.params.id);
  if (!foundCampground) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground: foundCampground });
};

module.exports.updateCampground = async (req, res) => {
  const updatedCampground = await Campground.findByIdAndUpdate(req.params.id, {
    ...req.body.campground,
  });

  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  updatedCampground.images.push(...imgs);

  await updatedCampground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Campground updated successfully");
  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Campground deleted!!!");
  res.redirect("/campgrounds");
};
