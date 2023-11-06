const express = require("express");
const app=express();
const path=require('path')
const bodyParser = require('body-parser')
const { Courses, Chapters, Pages, Users } = require('./models');
const passport=require('passport')
const connectEnsureLogin=require('connect-ensure-login')
const session = require('express-session')
const LocalStrategy=require('passport-local')



app.use(session({
  secret:"my-super-secret-key-2121156448852896",
  cookie:{
    maxAge:24*60*60*1000
  }
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use('students', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'   
}, async (email, password, done) => {
  try {
    const stud = await Users.findOne({where:{email,role:'student'}});
    if (!stud) {
      return done(null,false,{message:'Student not found'});
    }
    const match = await bcrypt.compare(password, stud.password);
    if (match) {
      return done(null, stud);
    } else {
      return done(null, false, { message: 'Incorrect password' });
    }
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((stud,done)=>{
  console.log("Serializing student in session",stud.id)
  done(null, stud.id)
})

passport.use('educator', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'   
}, async (email, password, done) => {
  try {
    const edu = await Users.findOne({where:{email,role:'educator'}});
    if (!edu) {
      return done(null,false,{message:'educator not found'});
    }
    const match = await bcrypt.compare(password, edu.password);
    if (match) {
      return done(null, edu);
    } else {
      return done(null, false, { message: 'Incorrect password' });
    }
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((edu,done)=>{
  console.log("Serializing educator in session",edu.id)
  done(null, edu.id)
})



/*const courseroute=require("./routes/courses")*/



app.use(bodyParser.json())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.set("view engine","ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));




app.get('/', (request, response)=>{
    
    response.render("index", {
        title: "Learning Management System"
        });
  })

  app.get('/courses',async (req,resp)=>{
    const courses = await Courses.findAll();
    resp.render("dashboard", {
      courses
      });
  })
  app.post('/courses',(req,resp)=>{
    resp.redirect('/courses/new')
  })

  app.get('/home',(req,resp)=>{
    
    resp.render('home')
  })

  app.get('/courses/new', (request, response)=>{
    
    response.render("courses", {
        title: "Learning Management System"
        });
  })
  app.post('/courses/new', async (request, response) => {
    const {name} = request.body;
    try {
      const course = await Courses.addnewcourse(
        {name});
    response.redirect(`/courses/${course.id}`);
    } catch (err) {
      console.error(err);
      response.status(500).send('Unable to connect to server'); 
    }
  });

  app.get('/courses/:id',async (request,response)=>{
    const courseId=request.params.id
    const course=await Courses.findByPk(courseId)
    response.render("chapter",{course})
    })
  app.post('/courses/:id',async(request,response)=>{
    try {
      const course=await Courses.findByPk(courseId)
      response.redirect(`/courses/${course.id}/chapters`);
    } catch (err) {
      console.error(err);
      response.status(500).send('Unable to connect to server');
  }})
  
  app.get('/courses/:id/chapters',async(request, response)=>{
    response.render("newchapters")
  })
    app.post('/courses/:id/chapters', async (req, res) => {
      const { title } = req.body;
      const { id } = req.params;
      const {description}=req.params;
      
      try {
        const course = await Courses.findByPk(id);
        const chapter = await Chapters.create({
          title,description,
          courseId: courses.id  
        });
        
        res.json(chapter);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    });
 /* app.get('/chapters/new', async (request,response)=>{
    response.render("newcourses")
  })*/

  

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

  app.post('/edsignup', async (request, response) => { 
    try {
        const users = await Users.create({
          firstName: request.body.firstName,
          lastName:request.body.lastName,
          email:request.body.email,
          password:request.body.password,
          roles: 'educator'})
       
        response.redirect("/courses");
    } catch (error) {
        console.log(error);
    }
});

  

  app.get('/signup', (request, response)=>{
    
    response.render("./signup/student", {
        title: "Learning Management System"
        });
  })

  app.post('/signup', async (request, response) => { 
    try {
        const users = await Users.create({
          firstName: request.body.firstName,
          lastName:request.body.lastName,
          email:request.body.email,
          password:request.body.password,
          roles: 'student'})
       
        response.redirect("/home");
    } catch (error) {
        console.log(error);
    }
});

  //signup and login


module.exports=app;