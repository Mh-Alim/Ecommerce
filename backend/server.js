const app = require('./app');
const dotenv = require('dotenv')
const connectDatabase = require('./config/dataBase')

// uncaught error -- 
// suppose i am writing -- console.log(youtube) and here yt is not defined so it will give me uncaught exception
// handling uncaught error

process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`closing server due to uncaught promise rejection`);
    process.exit(1);
})



// giving path to env 
dotenv.config({path:"backend/config/config.env"})

// connecting with database
connectDatabase();


const server = app.listen(process.env.PORT,()=>{
    console.log(`server is running on http/localhost:${process.env.PORT}`);
})


// Unhandeled promise rejections 

// For example config me jo mongodb link hai usme mongodb ko replace krde mongo se then jo error aayaga use hum unhandeled promise rejection error bolenge

process.on('unhandledRejection', (err)=>{
    console.log(`error: ${err.message}`);
    console.log("shutting down the server due to unhandeled promise rejection");

    server.close(()=>{
        process.exit(1);
    })
})