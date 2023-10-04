const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelpcamp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const campground = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city},${cities[random1000].state}`,
      images: [
        {
          url: "https://res.cloudinary.com/dtcv6w3k4/image/upload/v1695693195/YelpCamp/l3oqxdf5x4hzg4zaqqwj.jpg",
          filename: "YelpCamp/l3oqxdf5x4hzg4zaqqwj",
        },
        {
          url: "https://res.cloudinary.com/dtcv6w3k4/image/upload/v1695693195/YelpCamp/rnkqwwtiw5vtawm1tcqk.jpg",
          filename: "YelpCamp/rnkqwwtiw5vtawm1tcqk",
        },
      ],
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      author: "65102f38ee5eebca40eefe3d",
    });
    await campground.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
