const express = require("express");
const app=express();
const path=require('path')
const bodyParser = require('body-parser')


app.use(bodyParser.json())
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public/css")));
app.set("views", path.join(__dirname, "views"));

app.get('/', (request, response)=>{
    
    response.render("index", {
        title: "Learning Management System"
        });
  })


module.exports=app;