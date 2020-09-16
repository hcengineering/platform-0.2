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

import { AnyLayout, Attribute, Class, Classifier, MODEL_DOMAIN, Doc, Model, Mixin, Obj, Ref } from '@anticrm/core'
import core from '.'

interface Proxy {
  __layout: any
}

export class ModelDb extends Model {

  constructor() {
    super(MODEL_DOMAIN)
  }

  findClasses (query: AnyLayout): Class<Obj>[] {
    const classes = this.objectsOfClass(core.class.Class)
    return this.findAll(classes, core.class.Class, query) as Class<Obj>[]
  }

  private prototypes = new Map<Ref<Classifier<Obj>>, Object>()

  createPrototype (classifier: Classifier<Obj>): Object {
    const attributes = classifier._attributes as { [key: string]: Attribute }
    const descriptors = {} as PropertyDescriptorMap
    for (const key in attributes) {
      // const attribute = attributes[key]
      const attributeKey = this.attributeKey(classifier, key)
      const desc: PropertyDescriptor = {
        get (this: Proxy) {
          return this.__layout[attributeKey]
        }
      }
      descriptors[key] = desc
    }

    const proto = Object.create(classifier._extends ? this.getPrototype(classifier._extends) : Object.prototype)
    return Object.defineProperties(proto, descriptors)
  }

  getPrototype (mixin: Ref<Classifier<Obj>>): Object {
    const proto = this.prototypes.get(mixin)
    if (!proto) {
      const proto = this.createPrototype(this.get(mixin) as Classifier<Doc>)
      this.prototypes.set(mixin, proto)
      return proto
    }
    return proto
  }

  as<T extends Doc> (doc: Doc, mixin: Ref<Mixin<T>>): T {
    const proxy = Object.create(this.getPrototype(mixin)) as Proxy & T
    proxy.__layout = doc
    return proxy
  }

  cast<T extends Doc> (docs: Doc[], mixin: Ref<Mixin<T>>): T[] {
    return docs.map(doc => this.as(doc, mixin))
  }

  isMixedIn (obj: Doc, _class: Ref<Mixin<Doc>>): boolean {
    return obj._mixins ? obj._mixins.includes(_class) : false
  }

  ///

}
