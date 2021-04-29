
import { MongoClient } from 'mongodb'

let client: MongoClient | undefined

export async function handler (req: any, context: any) {

  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  // context.callbackWaitsForEmptyEventLoop = false
  try {
    if (client === undefined) {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/master'
      console.log('connecting to ' + uri)
      client = await MongoClient.connect(uri, { useUnifiedTopology: true })
    } else {
      console.log('reusing connection')
    }
    
    return {
      statusCode: 200,
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        'content-type': 'text/html; charset=utf8'
      },
      body: `hey there! `
    }      
  } catch (err) {
    return {
      statusCode: 200,
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        'content-type': 'text/html; charset=utf8'
      },
      body: String(err)
    }  
  }
  
  
}