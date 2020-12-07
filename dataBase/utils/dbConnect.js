const mongoose = require("mongoose");
require("dotenv").config();

const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}
const local_uri = process.env.LOCAL_DBURL;
const atlas_uri = process.env.ATLAS_DBURL;

const uri = (process.env.ENVIRONMENT == "Production") ? atlas_uri : local_uri;


mongoose.connect(uri, dbOptions);

mongoose.connection
    .on("error", _ => {
        console.log("> dataBase error occured");
    })
    .once("open", _ => console.log(process.env.ENVIRONMENT, 'Database Connected'));


module.exports = mongoose;