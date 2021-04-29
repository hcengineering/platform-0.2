
import { MongoClient, Db } from 'mongodb'
import type { HttpRequest, HttpResponse } from '@architect/functions'
import type { Context } from 'aws-lambda'

import { Request, Response, serialize, fromStatus } from '@anticrm/rpc'
import { methods } from '@anticrm/server-account'
import { Status, Severity, PlatformError } from '@anticrm/status'

let client: MongoClient | undefined

function httpResponse(statusCode: number, resp: Response<any>): HttpResponse {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf8'
    },
    body: serialize(resp)
  }
}

export async function handler (req: HttpRequest, context: Context): Promise<HttpResponse | undefined> {

  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false

  try {

    const request = req.body
    const method = (methods as { [key: string]: (db: Db, request: Request<any>) => Response<any> })[request.method]
    if (method === undefined) {
      throw new PlatformError(new Status(Severity.ERROR, 0, 'unknown method'))
    }

    if (client === undefined) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/master'
      client = await MongoClient.connect(uri, { useUnifiedTopology: true })
    }
    
    const result = await method(client.db(), request)
    return httpResponse(200, result)

  } catch (err) {
    const status = err instanceof PlatformError ? err.status : new Status(Severity.ERROR, -1, err.message)
    return httpResponse(200, fromStatus(status))
  }
  
}