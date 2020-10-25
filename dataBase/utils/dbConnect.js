const mongoose = require("mongoose");
require("dotenv").config();

const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}
const uri = process.env.ATLAS_DBURL;
mongoose.connect(uri, dbOptions);

mongoose.connection
    .on("error", _ => console.log("> dataBase error occured"))
    .once("open", _ => console.log("> Database Connected"));

module.exports = mongoose;