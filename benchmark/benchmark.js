'use strict'

const originalUrl = require('../')
const http = require('http')

function run (onRequest, opts) {
  const server = http.createServer(function (req, res) {
    onRequest(req)
    res.end()
  })

  server.listen(function () {
    opts.port = server.address().port
    const req = http.request(opts, function (res) {
      res.resume()
      res.on('end', function () {
        server.close()
      })
    })
    req.end()
  })
}

const COUNT = 1000000

function benchmark (name) {
  return function (req) {
    for (let r = 0; r < 4; r++) {
      const label = 'Run ' + r + ': Benchmark with ' + name + ' took'
      console.time(label)
      for (let i = 0; i < COUNT; i++) {
        originalUrl(req)
      }
      console.timeEnd(label)
    }
  }
}

// no special http headers
run(benchmark('no headers'), {})

// Forwarded - single header
run(benchmark('Forwarded header'), {headers: {
  'Forwarded': 'host=example.com; proto=https'
}})

// X-Forwarded-Host - multiple headers
run(benchmark('multiple X-Forwarded-Host headers'), {headers: {
  'X-Forwarded-Host': ['example.com', 'example.net']
}})
