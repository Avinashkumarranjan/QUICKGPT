import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        mongoose.connection.on("connected",()=>console.log("Database connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}/quickgpt`)
    } catch (error) {
        console.log(error.message,"Error in database")
    }
}
export default connectDB;