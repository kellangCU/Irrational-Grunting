var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true  })); // support encoded bodies
//Create Database Connection
var pgp = require('pg-promise')();

const dbConfig = process.env.DATABASE_URL;

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));

// Landing Page
app.get('/', function(req, res) {
  var query = "select * from events order by start_date_time limit 3";
  db.any(query)
    .then(function (rows) {
      res.render('pages/home', {
        console.log(rows);
        m_title:"CU Boulder Event Manager",
        data: rows
      })
    })
    .catch(function (err) {
      console.log("Error fetching events for home.");
      res.render('pages/home', {
        m_title:"CU Boulder Event Manager",
        data:""
      });
    })
});

app.get('/login', function(req, res) {
  res.render('pages/login', {
    m_title:"Login"
  });
});

app.get('/saved-events', function(req, res) {
  res.render('pages/my_saved_events', {
    local_css:"search.css",
    m_title:"Saved Events"
  });
});

app.get('/search', function(req, res) {
  res.render('pages/search', {
    local_css:"search.css",
    m_title:"Event Search"
  });
});

app.get('/signup', function(req, res) {
  res.render('pages/signUp', {
    local_css:"login.css",
    local_js:"login.js",
    m_title:"Sign Up"
  });
});

app.get('/user', function(req, res) {
  res.render('pages/user', {
    local_css:"calendar.css",
    m_title:"User Calendar"
  })
})
var port = process.env.PORT;
app.listen(process.env.PORT);
//app.listen(3000);
console.log("Listening on port " + port.toString());
