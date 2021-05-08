import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as awslambda from "aws-lambda"
import * as pulumi from '@pulumi/pulumi'
import * as mime from 'mime'

import { readdirSync, lstatSync } from 'fs'
import { join } from 'path'

import { MongoClient, Db } from 'mongodb'
import { Request, Response, serialize, fromStatus, Code as RpcCode } from '@anticrm/rpc'
import { methods as methods } from '@anticrm/server-account'
import { Status, Severity, PlatformError, unknownError, OK } from '@anticrm/status'


// const dist = '../../dev/prod/dist'

// const siteBucket = new aws.s3.Bucket('anticrm-test-bucket')

// function processFiles(dir: string) {
//   for (const item of readdirSync(join(dist, dir))) {
//     const filePath = join(dir, item)
//     const fullPath = join(dist, filePath)
//     const stats = lstatSync(fullPath)
//     if (stats.isDirectory()) {
//       processFiles(filePath)
//     } else {
//       new aws.s3.BucketObject(filePath, {        
//         bucket: siteBucket,
//         source: new pulumi.asset.FileAsset(fullPath),
//         contentType: mime.getType(fullPath) ?? undefined,
//       });  
//     }
//   }
// }

// processFiles('')

// export const bucketName = siteBucket.bucket

let client: MongoClient | undefined

function httpResponse(statusCode: number, resp: Response<any>) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    },
    body: serialize(resp)
  }
}

const endpoint = new awsx.apigateway.API("hello", {
  routes: [
    // Serve static files from the `www` folder (using AWS S3)
    // {
    //     path: "/",
    //     localPath: "www",
    // },

    // Serve a simple REST API on `GET /name` (using AWS Lambda)
    {
      path: "/source",
      method: "GET",
      eventHandler: (req, ctx, cb) => {
          cb(undefined, {
              statusCode: 200,
              body: Buffer.from(JSON.stringify({ name: "AWS" }), "utf8").toString("base64"),
              isBase64Encoded: true,
              headers: { "content-type": "application/json" },
          })
      }
    },
    {
      path: '/rpc',
      method: 'OPTIONS',
      eventHandler: async () => {
        return { 
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'      
          },
          body: ''
        }
      }
    },
    {
      path: '/rpc',
      method: 'POST',
      eventHandler: async (req, ctx) => {
        // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
        ctx.callbackWaitsForEmptyEventLoop = false

        try {
          if (req.body === null) {
            throw new PlatformError(new Status(Severity.ERROR, RpcCode.BadRequest, {}))
          }
          const request = JSON.parse(req.isBase64Encoded ? Buffer.from(req.body, 'base64').toString('utf8') : req.body)
          // Pulumi uses old TS version
          const method = (methods as unknown as { [key: string]: (db: Db, request: Request<any>) => Response<any> })[request.method]
          if (method === undefined) {
            throw new PlatformError(new Status(Severity.ERROR, RpcCode.UnknownMethod, { method: request.method }))
          }
      
          if (client === undefined) {
            const uri = 'mongodb+srv://ci:ci@cluster0.twepq.mongodb.net/master?retryWrites=true&w=majority'
            console.log('connecting to', uri)
            client = await MongoClient.connect(uri, { useUnifiedTopology: true })
          } else {
            console.log('reusing connection')
          }
          
          const result = await method(client.db(), request)
          return httpResponse(200, result)      
        } catch (err) {
          console.error('lambda error', err)
          const status = err instanceof PlatformError ? err.status : unknownError(err)
          return httpResponse(200, fromStatus(status))
        }      
      }
    }
  ]
})

export const url = endpoint.url
