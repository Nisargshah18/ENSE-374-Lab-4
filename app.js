// other requires
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { runInNewContext } = require("vm");

// app.use statements
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

const registerKey = "123456"; // secure!

function User(username, password) {
    this.username = username;
    this.password = password;
}

function Task (_id, name, owner, creator, done, cleared) {
    this._id = _id;
    this.name = name;
    this.owner = owner;
    this.creator = creator;
    this.done = done;
    this.cleared = cleared;
}

let userList = [];
let taskList = [];

function initializeUsers (userList) {
    userList.push(new User("user1@abc.com", "user1pass"));
    userList.push(new User("user2@123.com", "user2pass"));  
}

function initializeTasks (taskList) {
    taskList.push (new Task(0, "Unclaimed",              undefined,   userList[0], false, false));
    taskList.push (new Task(1, "Owned by 0, Unfinished", userList[0], userList[0], false, false));
    taskList.push (new Task(2, "Owned by 1, Unfinished", userList[1], userList[0], false, false));
    taskList.push (new Task(3, "Owned by 0, Finished",   userList[1], userList[0], true,  false));
    taskList.push (new Task(4, "Owned by 1, Finished",   userList[0], userList[0], true,  false));
    //taskList.push (new Task(5, "Task #5" ,userList[0], userList[1], true,  false));
    //taskList.push (new Task(6, "Task #6" ,userList[1], userList[0], true,  false));
    //taskList.push (new Task(7, "Task #7" ,userList[1], userList[1], true,  false));
}

function saveToJson (fileName, obj) {
    fs.writeFileSync(fileName, JSON.stringify(obj), "utf8",  function(err) {
        if (err) return console.log(err);
    });
}

function loadFromJSON (fileName) {
    let fileContents = fs.readFileSync(fileName, "utf8", function(err) {
        if (err) return console.log(err);
    });
    let fileObject = JSON.parse(fileContents);
    return fileObject;
}

// initializeUsers(userList);
// saveToJson (__dirname + "/users.json", userList);
// initializeTasks(taskList);
// saveToJson (__dirname + "/tasks.json", taskList);

userList = loadFromJSON (__dirname + "/users.json");
taskList = loadFromJSON (__dirname + "/tasks.json");

//console.log(userList)
//console.log(taskList)

function loadUsers() {
    userList = loadFromJSON (__dirname + "/users.json");
}
function saveUsers() {
    saveToJson (__dirname + "/users.json", userList);
}
function loadTasks() {
    taskList = loadFromJSON (__dirname + "/tasks.json");
}
function saveTasks() {
    saveToJson (__dirname + "/tasks.json", taskList);
}

app.listen(3000, function () {
    console.log("Server started on port 3000");
})

app.get("/", function (req, res) {
    res.render("index", { test: "Prototype" });
});

app.post("/register", function (req, res) {
    console.log("tried registering");
    if (req.body.authentication === registerKey) {
        console.log("registration key successful");
        loadUsers();
        userList.push(new User(req.body.username, 
                               req.body.password));
        saveUsers();
        res.redirect(307, "/todo");
    } else {
        res.redirect("/");
    }
});

app.post("/login", function (req, res) {
    loadUsers();
    let loggedIn = false;
    for (user of userList){    
        if (user.username === req.body.username &&
            user.password === req.body.password) {
            loggedIn = true;
            console.log("Logged in");
            res.redirect(307, "/todo");
        }
    }
    if (loggedIn === false) {
        res.redirect("/");
    }
});

app.post("/todo", function (req, res) {
    loadTasks();
    res.render("todo", {
        test: "Prototype",
        username: req.body.username,
        items: taskList
    });
})

app.get("/logout", function (req, res) {
    res.redirect("/");
});

app.post("/addtask", function (req, res) {
    for (user of userList){
        if (user.username === req.body.username) {
            taskList.push(new Task(taskList.length,
                                   req.body.newTask,
                                   undefined,
                                   user,
                                   false,
                                   false));
            saveTasks();
            res.redirect(307, "/todo");
        }
    }
});

app.post("/claim", function (req, res) {
    console.log(req.body);
    for (user of userList){
        if (user.username === req.body.username) {
            for (task of taskList) {
                if(task._id === parseInt(req.body.taskId)) {
                    task.owner = user;
                    saveTasks();
                    res.redirect(307, "/todo");
                }
            }
        }
    }
})

app.post("/abandonorcomplete", function (req, res) {
    if (req.body.checked === "on") {
        for (task of taskList) {
            if(task._id === parseInt(req.body.taskId)) {
                task.done = true;
                saveTasks();
                res.redirect(307, "/todo");
            }
        }
    } else {
        // you are "user"
        for (task of taskList) {
            if(task._id === parseInt(req.body.taskId)) {
                task.owner = undefined;
                saveTasks();
                res.redirect(307, "/todo");
            }
        }
    }
});

app.post("/unfinish", function (req, res) {
    for (task of taskList) {
        if(task._id === parseInt(req.body.taskId)) {
            task.done = false;
            saveTasks();
            res.redirect(307, "/todo");
        }
    }
});

app.post("/purge", function (req, res) {
    for (task of taskList) {
        if(task.done === true) {
            task.cleared = true;
        }
    }
    saveTasks();
    res.redirect(307, "/todo");
});




const passport = require ("passport");
const router = express.Router(); 
const session = require('express-session');
const indexRouter = require('index');
const usersRouter = require('users');
const authRouter = require('auth');

app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: false
    })
  );
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

/** Pass configured passport to auth router */
app.use('/auth', authRouter(passport));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;