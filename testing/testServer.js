var express   = require('express);
var jsOrch    = require('json-orchestrator-local');
var app       = express();

!(function() {
  // init function
  jsOrch.init({
    path: './patch',
    useStreaming: true
  });
  jsOrch.patch('users', 'userDB1.json');
  jsOrch.patch('users', 'userDB2.json');
  jsOrch.patch('users', 'userDB3.json');
  jsOrch.patch('questions', 'qs.json');
  //
  // What this will look like:
  // 
  // users ---------|--> userDB1.json
  //                |--> userDB2.json
  //                |--> userDB3.json
  //
  // questions --------> qs.json
  //
})();

app.use(function(req, res, next) {
  res.setHeader('!reval', 'TESTING');
  
  next();
});

app.get('/get', function(req, res) {
  var targetDatabase = req.query.db;
  var targetKey      = req.query.key;
  // var targetParent   = req.query.parent; // deprecated
  
  var json = jsOrch.stream({
    target: targetDatabase,        // The target patch (example: 'users')
    join: true                     // Join all patch JSON's into one 
  });
  
  json.find(targetKey);            // Uses the pre-built recursive search to find the key, returns value 
  
  res.json(json.value);
});

app.listen(8080, () => {
  console.log("Listening on port 8080, JS-ORCH-TESTING");
});
