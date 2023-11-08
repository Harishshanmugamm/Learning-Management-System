const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
var bcrypt = require("bcrypt");
var session = require("express-session");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const connectEnsurelogin = require("connect-ensure-login");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));

app.use(
  session({
    secret: "my-super-secret-key-54862598758687641257",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch(() => {
          return done(null, false);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing usersession: ", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

const { Courses, Chapters, Pages, User } = require("./models");
const saltRounds = 10;


app.get("/", (req, res) => {
  res.render("index", {
    title: "Learning-Management-System",
  });
});

app.get("/edsignup", (req, res) => {
  res.render("educator", {
    title: "Sign-up Form",
  });
});

app.post("/eusers", async (req, res) => {
  const Hashed = await bcrypt.hash(req.body.password, saltRounds);
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: Hashed,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/courses/new");
    });
  } catch (error) {
    res.redirect("/");
    console.log(error);
  }
});


app.post("/susers", async (req, res) => {
  const Hashed = await bcrypt.hash(req.body.password, saltRounds);
  try {
    const user = await User.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: Hashed,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    res.redirect("/");
    console.log(error);
  }
});
app.get("/educator/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.post(
  "/educatorlogin",
  passport.authenticate("local", {
    failureRedirect: "/educator/login",
  }),

  (req, res) => {
    console.log(req.user);
      res.redirect("/courses/new");

    }
);
app.post("/studentlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });
    return res.redirect("/courses/new");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.post(
  "/studentlogin",
  passport.authenticate("local", {
    failureRedirect: "/studentlogin",
  }),
  (req, res) => {
    console.log(req.user);
      res.redirect("/courses/new");
 
    }
);



app.get("/signout", connectEnsurelogin.ensureLoggedIn(), (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/courses/new", connectEnsurelogin.ensureLoggedIn(), (req, res) => {
  res.render("courses");
});

app.post("/courses/new", connectEnsurelogin.ensureLoggedIn(), async (req, res) => {
  try {
    const title = req.body.title;
    const course = await Courses.create({ title });
    res.redirect(`/courses/${course.id}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/courses/:id',async (request,response)=>{
  const courseId=request.params.id
  const course=await Courses.findByPk(courseId)
  response.render("chapter",{courseId,course})
  })

app.post("/courses/:id/chapters/new", async (request, response) => {
  try {
      const { title, description} = request.body;
      const courseId=request.params.id
      console.log(courseId)
      if (!courseId) {
        return res.status(400).json({ error: "Course ID is missing" });
      }
      const chapter = await Chapters.addChapter({
        title,
        description,
        courseId,
      });
      console.log(courseId);
      response.redirect(`/courses/${courseId}/chapters/${chapter.id}/page`);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get(
    `/courses/:courseId/chapters/:chapterId/page`,
    connectEnsurelogin.ensureLoggedIn(),
    async (req, res) => {
      const chapterId = req.params.chapterId;
      const courseId = req.params.courseId;
      const chapter = await Chapters.findOne({ where: { id: chapterId } });
      const course=await Courses.findOne({where:{id:courseId}})
        res.render("page", {
          chapter,
          course,
          courseId,
          chapterId,
        });
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  );

  app.post("/course/:courseId/chapter/:chapterId/page/new", async (req, res) => {
    try {
      const { title, content } = req.body;
      const chapterId=req.params.chapterId
      const page = await Pages.create({
        title: title,
        content: content,
        chapterId: chapterId,
      });
      const courseId = req.params.courseId;
      const pageId = page.id;
      res.redirect(`/view/${courseId}/${chapterId}/${pageId}`);
      console.log(pageId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get(
    "/view/:courseId/:chapterId/:pageId",
    connectEnsurelogin.ensureLoggedIn(),
    async (req, res) => {
      const courseId = req.params.courseId;
      const chapterId = req.params.chapterId;
      const pageId = req.params.pageId;
  
      try {
        const page = await Pages.findByPk(pageId);
        res.render("pageview", {
          title:page.title,
          content:page.content,
          courseId,
          chapterId,
          });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
  );
  
module.exports = app;
