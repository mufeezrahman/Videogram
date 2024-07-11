import 'dotenv/config'
import connectDB from "./db/connectDB.js";
import { app } from './app.js';

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((error) =>{
    console.log("Connection to MongoDB failed");
})




/*
import express from "express"
const app=express();

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        app.on("error",(error)=>{
            console.log("Error:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Listening on ${process.env.PORT}`)
        })
    }
    catch(error){
        console.log("Error:",error);
        throw error
    }
})()
    */