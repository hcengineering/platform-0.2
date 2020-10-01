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

import { Db, MongoClient } from 'mongodb'
import { AnyLayout, ArrayOf, Attribute, Class, CORE_CLASS_ARRAYOF, Doc, Model, MODEL_DOMAIN, Ref, Storage } from '@anticrm/core'

export class MongoStorage implements Storage {
  private modelDb: Model = undefined as unknown as Model
  private mongoClient: MongoClient = undefined as unknown as MongoClient
  private db: Db = undefined as unknown as Db

  async initialize (mongoUri: string, dbName: string): Promise<void> {
    console.log(`connecting to mongo '${mongoUri}'...`)
    this.mongoClient = await MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    console.log(`use dbName '${dbName}'`)
    this.db = this.mongoClient.db(dbName)

    console.log('loading model domain...')
    this.modelDb = new Model(MODEL_DOMAIN)
    this.modelDb.loadModel(await this.db.collection(MODEL_DOMAIN).find({}).toArray())
    console.log('Mongo storage initialized.')
  }

  async close (): Promise<void> {
    if (this.mongoClient) {
      this.mongoClient.close()
    }
  }

  getModelDb() {
    return this.modelDb
  }

  store (doc: Doc): Promise<any> {
    const domain = this.modelDb.getDomain(doc._class)
    console.log('STORE:', domain, doc)
    return this.db.collection(domain).insertOne(doc)
  }

  push (_class: Ref<Class<Doc>>, _id: Ref<Doc>, attribute: string, attributes: any): Promise<any> {
    const domain = this.modelDb.getDomain(_class)
    const clazz = this.modelDb.get(_class) as Class<Doc>
    const attr = (clazz._attributes as any)[attribute] as Attribute
    const addToUniqueCollection = attr && this.modelDb.is(attr.type._class, CORE_CLASS_ARRAYOF) && (attr.type as ArrayOf<any>).unique

    const updateValue = { [attribute]: attributes }
    const updateQuery = addToUniqueCollection ? { $addToSet : updateValue } : { $push: updateValue }
    return this.db.collection(domain).updateOne({ _id }, updateQuery)
  }

  update (_class: Ref<Class<Doc>>, selector: object, attributes: any): Promise<any> {
    const domain = this.modelDb.getDomain(_class)
    return this.db.collection(domain).updateOne(selector, { $set: attributes })
  }

  remove (_class: Ref<Class<Doc>>, doc: Ref<Doc>): Promise<any> {
    throw new Error('Not implemented yet')
  }

  find<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, options?: AnyLayout): Promise<T[]> {
    const domain = this.modelDb.getDomain(_class)
    const cls = this.modelDb.getClass(_class)
    const q = {}
    this.modelDb.assign(q, _class, query)
    return this.findInDomain(domain, { ...q, _class: cls}, options)
  }

  findOne<T extends Doc> (_class: Ref<Class<T>>, query: AnyLayout, options?: AnyLayout): Promise<T|null> {
    const domain = this.modelDb.getDomain(_class)
    const cls = this.modelDb.getClass(_class)
    const q = {}
    this.modelDb.assign(q, _class, query)
    return this.db.collection(domain).findOne({ ...q, _class: cls}, options)
  }

  findInDomain<T extends Doc> (domain: string, query: AnyLayout, options?: AnyLayout): Promise<T[]> {
    return this.db.collection(domain).find(query, options).toArray()
  }
}
