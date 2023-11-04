const express = require("express");
const app=express();
const path=require('path')
const bodyParser = require('body-parser')
app.use(express.json());
const { Users,Courses } = require("./models");



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));



app.get('/', (request, response)=>{
    
    response.render("index", {
        title: "Learning Management System"
        });
  })
  app.get('/course', (request, response)=>{
    
    response.render("courses", {
        title: "Learning Management System"
        });
  })
app.post('/course',async (request,response)=>{
  try{
    const {title,desc}=request.body
    const course = await Courses.create({ title,description});
    response.json(course);
  } catch(err){
    console.error(err)
    

  }

})

module.exports=app;