const express = require("express");
const app=express();
const path=require('path')
const bodyParser = require('body-parser')
const { Courses, Chapters, Pages, Users } = require('./models');
const passport=require('passport')
const connectEnsureLogin=require('connect-ensure-login')
const session = require('express-session')
const LocalStrategy=require('passport-local')
const bcrypt= require('bcrypt');

const saltRounds = 10;

app.use(bodyParser.json());


app.use(session({
  secret:"my-super-secret-key-2121156448852896",
  cookie:{
    maxAge:24*60*60*1000
  }
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use( new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password', 
  roleField:'role' 
}, async (email, password, done) => {
  
  try {
    const user = await Users.findOne({ where: { email } });
    const match = await bcrypt.compare(password, user.password);

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    if (user.roles === 'student') {

      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } else {
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    }
  } catch (error) {
    return done(null,error);
  }
}));


passport.serializeUser((user,done)=>{
  console.log("Serializing student in session",user.id)
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findByPk(id);

    if (!user) {
      return done(new Error('Invalid user'));
    }

    if (user.roles !== 'student' && user.roles !== 'educator') {
      return done(new Error('Invalid roles'));
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});




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

  app.get('/courses',connectEnsureLogin.ensureLoggedIn(), async (req,resp)=>{
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


app.post('/educatorlogin',passport.authenticate('local',{failureRedirect:"/"},{successRedirect: '/courses'}),(request,response)=>{
  response.redirect("/courses");
})
  app.get('/edsignup', (request, response)=>{
    
    response.render("./signup/educator", {
        title: "Learning Management System"
        });
  })

  app.post('/edsignup', async (request, response) => { 
    const hashedPwd = await bcrypt.hash(request.body.password,saltRounds)
    console.log(hashedPwd)
    try {
        const users = await Users.create({
          firstName: request.body.firstName,
          lastName:request.body.lastName,
          email:request.body.email,
          password:hashedPwd,
          roles: 'educator'})
          request.login(users,(err)=>{
          if(err){
            console.log(err)
          }
          response.redirect("/courses");
        })
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
          request.login(users,(err)=>{
            if(err){
              console.log(err)
            }
            response.redirect("/home");
          })
       
       
    } catch (error) {
        console.log(error);
    }
});

  //signup and login


module.exports=app;