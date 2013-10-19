var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var aggregate = require('./aggregate');

// Constants
var admin_email = 'getfetch@gmail.com';
var admin_password = process.env.ADMIN_PASSWORD || '';

// App config
var app = express();
app.engine('html', swig.renderFile);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: process.env.SECRET_KEY || 'DEVELOPMENT'}));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', process.env.CACHE || false);
swig.setDefaults({ cache: false });

// Middleware
function requireLogin(request, response, next) {
 if (request.session.loggedIn) {
    next();
  } else {
    response.redirect('/login');
  }
}

// Routes
app.get('/*', function(request, response, next) {
  // Redirect www to non-www domain
  if(request.headers.host.match(/^www/)) {
    response.redirect(301, 'http://' + request.headers.host.replace(/^www\./, '') + request.url);
  } else {
    next();
  }
});

app.get('/', function (request, response) {
  response.render('index', { /* template locals context */ });
});

app.get('/login', function (request, response) {
  response.render('login');
})
.post('/login', function (request, response) {
  if (request.body.email !== admin_email || request.body.password !== admin_password) {
    response.render('login', {
      email: request.body.email,
      error: 'Incorrect email or password.',
    });
  } else {
    // TODO: Make this more secure
    request.session.loggedIn = true;
    response.redirect('/');
  }
});

app.get('/logout', function (request, response) {
  request.session.loggedIn = false;
  response.redirect('/');
});

app.get('/admin', requireLogin, function (request, response) {
  response.render('admin');
});

// Run server
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});
