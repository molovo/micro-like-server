import micro from 'micro'
import test from 'ava'
import listen from 'test-listen'
import request from 'request-promise'
import {StatusCodeError} from 'request-promise-core/errors'
import handler from './index'

// Bootstrap the service
const service = micro(handler)

/**
 * Test that a GET request prints a status message,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('GET request returns status message', async t => {
  const url = await listen(service)
  const body = await request(url)

  t.deepEqual(JSON.parse(body).message, 'The server is up and running!')
})

/**
 * Test that a HEAD request returns no body,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('HEAD request returns no body', async t => {
  const url = await listen(service)
  const response = await request({
    uri: url,
    method: 'HEAD',
    json: true,
    resolveWithFullResponse: true
  })

  t.is(response.statusCode, 204)
  t.is(typeof response.body, 'undefined')
})

/**
 * Test that a OPTIONS request returns an empty object,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('OPTIONS request returns empty object', async t => {
  const url = await listen(service)
  const body = await request({
    uri: url,
    method: 'OPTIONS',
    json: true
  })

  t.deepEqual(body, {})
})

/**
 * Test that a POST request without any request data returns a 400 error,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('POST request with no data returns 400', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'POST',
    body: {},
    json: true
  }), StatusCodeError)

  t.is(error.message, '400 - {"error":"You must provide a URL"}')
})

/**
 * Test that a request on a disallowed method returns a 405 error,
 * without doing any payment processing
 *
 * @param  {Test} t
 */
test('Disallowed methods return 405', async t => {
  const url = await listen(service)
  const error = await t.throws(request({
    uri: url,
    method: 'PUT',
    body: {},
    json: true
  }), StatusCodeError)

  t.is(error.message, '405 - {"error":"Method Not Allowed"}')
})
