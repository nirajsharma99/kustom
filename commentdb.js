function dbConnect(){
const mongoose = require("mongoose");

mongoose.createConnection("mongodb://localhost/comments",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
},(error)=>{
    if(!error)
    {
        console.log("Comment Database Connected..");
    }
    else{
        console.log("Comment Database connection failed");
    }
})

}
module.exports = dbConnect