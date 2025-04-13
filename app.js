const express =require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
    console.log("connected to DB");
})
    .catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
    res.send("Hello I am root");
});

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    
}));

//new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync(async (req, res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings",
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    }));
//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

  //Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = req.body.listing;

    if (updatedListing.image && typeof updatedListing.image === "object") {
        updatedListing.image = {
            filename: updatedListing.image.filename || "default_filename",
            url: updatedListing.image.url || "default_url",
        };
    }

    await Listing.findByIdAndUpdate(id, updatedListing, { new: true });
    res.redirect(`/listings/${id}`);
}));
//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//     });

// await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404,"Page Not Found"));
});
app.use((err, req, res, next) => {
    let { statusCode=500,message="something went wrong!"} = err;
    res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});