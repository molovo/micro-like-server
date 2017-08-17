require('dotenv').config()

const Redis = require('ioredis')
const {send, json} = require('micro')
const url = require('url')
const redis = new Redis()

/**
 * Create the request handler
 *
 * @param  {object} request
 * @param  {object} response
 *
 * @return {string|null}
 */
module.exports = async (request, response) => {
  // Set Headers
  response.setHeader('Access-Control-Request-Method', 'POST, GET')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  response.setHeader('Access-Control-Allow-Origin', process.env.MICRO_ALLOW_DOMAIN)

  // Get the request method from the request
  const {method} = request

  // Choose a response based on the request method
  switch (method) {
    // HEAD requests should return no body
    case 'HEAD': {
      return null
    }

    // OPTIONS requests are used for access control
    case 'OPTIONS': {
      return {}
    }

    // For GET requests, print a simple status message
    case 'GET': {
      const {query} = url.parse(request.url, true)
      const key = `posts.likes.${query.url}`

      if (query.url) {
        const count = await redis.get(key)

        return {
          likes: count
        }
      }

      return {
        message: 'The server is up and running!',
        timestamp: new Date().toISOString()
      }
    }

    // For POST requests, handle the payment
    case 'POST': {
      const data = await json(request)
      const key = `posts.likes.${data.url}`

      if (data.url) {
        if (data.unlike) {
          redis.decr(key)
        } else {
          redis.incr(key)
        }

        return {
          success: true
        }
      }

      send(response, 400, {
        error: 'You must provide a URL'
      })

      break
    }

    // All other methods not allowed
    default: {
      send(response, 405, {
        error: 'Method Not Allowed'
      })
    }
  }

  response.end()
}
