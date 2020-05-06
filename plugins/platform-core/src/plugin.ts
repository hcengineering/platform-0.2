//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { Platform } from '@anticrm/platform'
import { CorePlugin, Query, pluginId } from '.'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, RefTo, SessionProto,
  PropertyType, BagOf, InstanceOf, Embedded,
} from '.'
import { MemDb } from './memdb'

//////////

type Layout<T extends Obj> = T & { __layout: any } & SessionProto

export class TCodePlugin implements CorePlugin {

  readonly platform: Platform
  readonly pluginId = pluginId

  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  private sessionProto: SessionProto

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()

    this.sessionProto = {
      getSession: () => this,
    }
  }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      const passForward = key.startsWith('_')
      if (passForward) {
        result[key] = {
          get(this: Layout<Obj>) {
            return this.__layout[key] ?? attributes[key]._default
          },
          enumerable: true,
        }
      } else {
        const attribute = attributes[key]
        const instance = this.instantiate(attribute)
        result[key] = {
          get(this: Layout<Obj>) {
            const value = this.__layout[key]
            return instance.exert(value)
          },
          enumerable: true,
        }
      }
    }
    return result
  }

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    const classInstance = this.memdb.get(clazz) as Class<Obj>
    const extend = classInstance.extends
    const parent = extend ? this.getPrototype(extend) : this.sessionProto
    const proto = Object.create(parent)
    this.prototypes.set(clazz, proto)

    const descriptors = this.createPropertyDescriptors(classInstance.attributes)
    if (classInstance.native) {
      const proto = this.platform.getMetadata(classInstance.native)
      Object.assign(descriptors, Object.getOwnPropertyDescriptors(proto))
    }
    Object.defineProperties(proto, descriptors)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  instantiate<T extends Obj>(obj: T): T {
    const instance = Object.create(this.getPrototype(obj._class)) as Layout<T>
    instance.__layout = obj
    return instance
  }

  getInstance<T extends Doc>(ref: Ref<T>): T {
    return this.instantiate(this.memdb.get(ref))
  }

  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiate(layout))
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

  ////

  loadModel(docs: Doc[]): void {
    this.memdb.load(docs)
  }

  ////

  // mixin<M extends I, I extends Doc>(doc: Ref<I>, mixinClass: Ref<Mixin<M>>): M {
  // const layout = this.memdb.get(doc) as I
  // let mixins = layout._mixins // TODO: hide _mixin or make Layout recursive
  // if (!mixins) {
  //   mixins = []
  //   layout._mixins = mixins
  // }
  // const mixin = { _class: mixinClass }
  // mixins.push(mixin)

  // const proxy = new MixinProxy(mixin, this.getPrototype(mixinClass) as M, layout)
  // return new Proxy(proxy, this.mixinProxy) as unknown as M
  //   return {} as M
  // }
}

export default (platform: Platform): CorePlugin => {

  platform.setMetadata(core.native.Object, Obj.prototype)
  platform.setMetadata(core.native.RefTo, RefTo.prototype)
  platform.setMetadata(core.native.Type, Type.prototype)
  platform.setMetadata(core.native.BagOf, BagOf.prototype)
  platform.setMetadata(core.native.InstanceOf, InstanceOf.prototype)

  return new TCodePlugin(platform)
}
