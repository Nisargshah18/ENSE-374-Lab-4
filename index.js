var express = require('express');
var router = express.Router();

var loggedin =  function loginRequired(req, res, next) {

    if (req.user) {
        return next();
    }
    req.flash('error', 'Please Login First');
    return res.redirect('/index');
}



/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
    res.render('todo', { title: 'Express' });
  });

  router.get('/signup', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  router.get('/profile', function(req, res, next) {
    res.send(req.session);
  });
  router.get('/logout', function(req, res, next) {
    req.logout()
    res.send('/')
  });


module.exports = router;