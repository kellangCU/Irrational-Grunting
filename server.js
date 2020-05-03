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

function stripText(input) {
  input = input.replace('"','');
  input = input.replace("'","");
  input = input.replace('<','');
  input = input.replace('>','');
  return input;
}

// Landing Page
app.get('/', function(req, res) {
  var query = "select * from events order by start_date_time limit 3";
  db.any(query)
    .then(function (rows) {
      res.render('pages/home', {
        m_title:"CU Boulder Event Manager",
        local_css:"search.css",
        data: rows
      })
    })
    .catch(function (err) {
      console.log("Error fetching events for home.");
      res.render('pages/home', {
        m_title:"CU Boulder Event Manager",
        local_css:"search.css",
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

app.get('/registration', function(req, res) {
  res.render('pages/registration', {
    m_title:"Organization Registration",
    response:'',
    err:''
  })
});

app.post('/registration', function(req, res) {
  var organization_name = req.body.org_name;
  var contact = req.body.contact;
  organization_name = stripText(organization_name);
  contact = stripText(contact);
  var query = "insert into organizations (org_name, contact) values('"+organization_name+"','"+contact+"')";
  db.any(query)
    .then(function (data) {
      res.render('pages/registration', {
        m_title:"Organization Registration",
        response:"Successfully Registered Organization",
        err:''
      })
    })
    .catch(error => {
      console.log(error);
      res.render('pages/registration', {
        m_title:"Organization Registration",
        response:"Error Registering Organization:",
        err: error
      })
    })
});

app.get('/addEvent', function(req, res) {
  var query = "select org_name,organization_id from organizations order by org_name;";
  db.any(query)
    .then(function (rows) {
      res.render('pages/addEvent', {
        m_title:'Add Event',
        data:rows,
        response:''
      })
    })
    .catch(function (err) {
      console.log("Error fetching organizations for addEvent.");
      console.log(err);
      res.render('pages/addEvent', {
        m_title:'Add Event',
        data:'',
        response:'Error fetching organizations'
      });
    })
});

app.post('/addEvent', function(req, res) {
  var title = req.body.eventName;
  var time = req.body.date;
  var location = req.body.location;
  var id = req.body.organization;
  //var contact = req.body.contact;
  var description = req.body.description;
  var attribute = 0;
  if (req.body.t_academic)
    attribute += req.body.t_academic;
  if (req.body.t_clubs)
    attribute += req.body.t_clubs;
  if (req.body.t_sports)
    attribute += req.body.t_sports;
  if (req.body.t_fundraising)
    attribute += req.body.t_fundraising;
  if (req.body.t_music)
    attribute += req.body.t_music;
  if (req.body.t_talks)
    attribute += req.body.t_talks;
  if (req.body.t_other)
    attribute += req.body.t_other;
  var query_org = "select org_name,organization_id from organizations order by org_name;";
  var query_insert ="insert into events "
                  + "(event_title, start_date_time, location, attribute, description, organization_id, contact) "
                  + "values ('"+title+"','"+time+"','"+location+"','"+attribute+"','"+description+"','"+id+"',"
                  + "(select contact from organizations where organization_id="+id+"));";
  //var query_org_update ="update organizations set upcoming_events=("
  //                    + "(select upcoming_events from organizations where organization_id="req.body.organization") || ARRAY[""]"
  db.task('get-everything', task => {
    return task.batch([
      task.any(query_org),
      task.any(query_insert),
      //task.any(query_org_update)
    ])
  })
  .then(info => {
    res.render('pages/addEvent', {
      m_title:'Add Event',
      data: info[0],
      response:'Successfully submitted event'
    })
  })
  .catch(error => {
    console.log(error);
    res.render('pages/addEvent', {
      m_title:'Add Event',
      data:'',
      response:'Error submitting event'
    })
  })
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
var port = 3000;
port = process.env.PORT;
app.listen(port);
console.log("Listening on port " + port.toString());
