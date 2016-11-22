var request = require('request')

var url = 'http://localhost:5984/'
var db = 'pokemon/'
var id = 'document_id'

// Create a database/collection inside CouchDB
request.put(url + db, function(err, resp, body) {
  // Add a document with an ID
  request.put({
    url: url + db + id,
    body: {message:'New Shiny Document', user: 'stefan'},
    json: true,
  }, function(err, resp, body) {
    // Read the document
    request(url + db + id, function(err, res, body) {
      console.log(body.user + ' : ' + body.message)
    })
  })
})

// Save a document
exports.save = function(db, doc, done) {
  request.put({
    url: url + '/' + db + '/' + doc._id,
    body: doc,
    json: true,
  }, function(err, resp, body) {
    if (err) return done('Unable to connect CouchDB')
    if (body.ok) {
      doc._rev = body.rev
      return done(null ,doc)
    }

    done('Unable to save the document')
  })
}

// Get all documents with the built-in 'All' view
exports.all = function(db, options, done) {
  var params = querystring.stringify({
    include_docs: options.include_docs === false ? false : true,
    descending: options.descending,
    skip: options.skip,
    limit: options.limit,
    key: options.key,
    startkey: options.startkey,
    endkey: options.endkey,
  })

  request({
    url: url + '/' + db + '/_all_docs?' + params,
    json: true,
  }, function(err, res, body) {
    if (err) return done('Unable to connect to CouchDB')
    done(null, body)
  })
}