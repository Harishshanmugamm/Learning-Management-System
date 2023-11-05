const express = require("express");
const app=express();
const path=require('path')
const bodyParser = require('body-parser')
const { Courses, Chapters, Pages } = require('./models');
const courses = require("./models/courses");

/*const courseroute=require("./routes/courses")*/



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

  app.get('/dashboard',(req,resp)=>{
    resp.render("dashboard", {
      title: "Learning Management System"
      });
  })
  app.get('/courses/new', (request, response)=>{
    
    response.render("courses", {
        title: "Learning Management System"
        });
  })
  app.post('/courses/new/', async (request, response) => {
    const { name} = request.body;
    
    try {
      const course = await Courses.addnewcourse(
        name);
      
    
      response.redirect(`/courses/${course.id}`);
    } catch (err) {
      console.error(err);
      response.status(500).send('Unable to connect to server'); 
    }
  });

  app.get('/courses/:id',async (request,response)=>{
    const titlevalue=request.Courses
    const course = await Courses.getvalues(titlevalue);
 console.log(course)
 
    response.render("chapter",{course})
  
  
    })
  
  app.get('/chapter/:id/chapters/new', async (request,response)=>{
    response.render("newcourses")
  })

  

//Signup and login
app.get('/signin', (request, response)=>{
    
    response.render("index", {
        title: "Learning Management System"
        });
})
  app.get('/edsignup', (request, response)=>{
    
    response.render("./signup/educator", {
        title: "Learning Management System"
        });
  })

  app.get('/signup', (request, response)=>{
    
    response.render("./signup/student", {
        title: "Learning Management System"
        });
  })

  //signup and login

  app.post('/:id/chapters', async (req, res) => {
    const { title } = req.body;
    const { id } = req.params;
    
    try {
      const course = await Courses.findByPk(id);
      const chapter = await Chapters.create({
        title,
        courseId: courses.id  
      });
      
      res.json(chapter);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

module.exports=app;