//
// Copyright © 2020 Anticrm Platform Contributors.
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { MongoClient } from 'mongodb'
import { Model, Strings } from './boot'

const modelJson = JSON.stringify(Model)
console.log(modelJson)

const stringsJson = JSON.stringify(Strings)
console.log(stringsJson)

const fs = require('fs')

fs.writeFile(__dirname + "/../../prod/src/model.json", modelJson, 'utf8', function (err: Error) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.")
    return console.log(err);
  }
  console.log("model saved.")
})

fs.writeFile(__dirname + "/../../prod/src/strings.json", stringsJson, 'utf8', function (err: Error) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.")
    return console.log(err);
  }
  console.log("strings saved.")
})

function initDatabase (uri: string, tenant: string) {
  MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
    const db = client.db(tenant)
    db.collection('model', (err, coll) => {
      coll.deleteMany({}, () => {
        coll.insertMany(Model).then(() => { client.close() })
      })
    })
  })

}

const mongodbUri = process.env.MONGODB_URI
if (mongodbUri) {
  console.log('uploading new model to MongoDB...')
  initDatabase(mongodbUri, 'latest-model')
} else {
  console.log('skip database model update -- no mongodb uri provided.')
}

