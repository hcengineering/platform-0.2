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

import { Platform, Resource, AnyPlugin } from '@anticrm/platform'
import { Db } from '@anticrm/platform-db'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, Emb,
  PropertyType, BagOf, Content, CorePlugin
} from '.'
import { TSession, SessionProto, Konstructor, Layout } from './session'

/// ///////

console.log('PLUGIN: parsed core')

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { db: Db }): Promise<CorePlugin> => {
  console.log('PLUGIN: started core')

  abstract class TSessionProto implements SessionProto {
    getSession (): TSession { throw new Error('session provide the implementation') }
    abstract __mapKey (_class: Ref<Class<Obj>>, key: string): string | null
  }

  class TEmb extends TSessionProto implements Emb {
    _class!: Ref<Class<this>>
    toIntlString (plural?: number): string { return this.getClass().toIntlString(plural) }
    getClass (): Class<this> {
      return this.getSession().getInstanceSync(this._class)
    }

    __mapKey (_class: Ref<Class<Obj>>, key: string) { return key }
  }

  class TDoc extends TSessionProto implements Doc {
    _class!: Ref<Class<this>>
    _id!: Ref<this>
    toIntlString (plural?: number): string { return this.getClass().toIntlString(plural) }
    getClass (): Class<this> {
      return this.getSession().getInstanceSync(this._class)
    }

    as<T extends Doc> (_class: Ref<Class<T>>): Promise<T | undefined> {
      return this.getSession().as(this as unknown as Layout<Doc>, _class)
    }

    mixins (): Ref<Class<Doc>>[] {
      const layout = this as unknown as Layout<Doc>
      return layout.__layout._classes as Ref<Class<Doc>>[]
    }

    __mapKey (_class: Ref<Class<Obj>>, key: string) { return key.startsWith('_') ? key : _class + '/' + key }
  }

  // T Y P E S

  class TType<T extends PropertyType> extends TEmb implements Type<T> {
    _default?: T
    exert (value: T, target?: PropertyType, key?: PropertyKey): any { return value ?? this._default } // eslint-disable-line
    hibernate (value: any): T { return value }
  }

  class TInstanceOf<T extends Emb> extends TType<T> {
    of!: Ref<Class<T>>
    exert (value: T) {
      if (typeof value === 'object') { return this.getSession().instantiateSync(value._class, value) }
      return undefined
    }
  }

  // C O L L E C T I O N S : A R R A Y

  class ArrayProxyHandler implements ProxyHandler<PropertyType[]> {
    private type: Type<PropertyType>

    constructor (type: Type<PropertyType>) {
      this.type = type
    }

    get (target: PropertyType[], key: PropertyKey): any {
      const value = Reflect.get(target, key)
      return this.type.exert(value)
    }
  }

  class TArrayOf<T extends PropertyType> extends TType<T[]> {
    of!: Type<T>
    exert (value: T[]) {
      console.log('array')
      console.log(value)
      return new Proxy(value, new ArrayProxyHandler(this.of))
    }
  }

  // C O L L E C T I O N S : B A G

  class BagProxyHandler implements ProxyHandler<Bag<PropertyType>> {
    private type: Type<PropertyType>

    constructor (type: Type<PropertyType>) {
      this.type = type
    }

    get (target: Bag<PropertyType>, key: string): any {
      const value = Reflect.get(target, key)
      return this.type.exert(value)
    }
  }

  class TBagOf<T extends PropertyType> extends TType<Bag<T>> implements BagOf<T> {
    of!: Type<T>
    exert (value: Bag<T>) {
      if (typeof value === 'object') { return new Proxy(value, new BagProxyHandler(this.of)) }
      return undefined
    }
  }

  // S T R U C T U R A L  F E A T U R E S

  abstract class TStructuralFeature<T extends Obj> extends TDoc implements Class<T> {
    _attributes!: Bag<Type<PropertyType>>
    _extends?: Ref<Class<Obj>>
    _native?: Resource<T>

    abstract createConstructor (): Konstructor<T>

    newInstance (data: Content<T>): Promise<T> {
      const session = this.getSession()
      let ctor = session.constructors.get(this._id) as Konstructor<T>
      if (!ctor) {
        ctor = this.createConstructor()
        session.constructors.set(this._id, ctor)
      }
      return ctor(data)
    }
  }

  class TStruct<T extends Obj> extends TStructuralFeature<T> {
    toIntlString (plural?: number): string { return 'struct: ' + this._id } // eslint-disable-line

    createConstructor (): Konstructor<T> {
      const session = this.getSession()
      const _class = this._id as Ref<Class<T>>
      return data => session.createEmb(_class, data)
    }
  }

  class TClass<T extends Doc> extends TStructuralFeature<T> {
    toIntlString (plural?: number): string { return 'doc: ' + this._id } // eslint-disable-line

    createConstructor (): Konstructor<T> {
      const session = this.getSession()
      const _class = this._id as Ref<Class<T>>
      return data => session.createDoc(_class, data)
    }
  }

  // B O O T  S E S S I O N  &  P L U G I N

  class TCorePlugin implements CorePlugin {
    readonly platform: Platform
    readonly pluginId = core.id

    private session: TSession
    private prototypes = new Map<Resource<object>, object>()

    constructor (platform: Platform, session: TSession) {
      this.platform = platform
      this.session = session
    }

    async resolve (resource: Resource<object>): Promise<object> {
      const proto = this.prototypes.get(resource)
      if (proto) { return proto }
      const index = resource.indexOf(':') + 1
      const dot = resource.indexOf('.', index)
      const plugin = resource.substring(index, dot) as AnyPlugin
      return platform.getPlugin(plugin).then(plugin => {
        const proto = this.prototypes.get(resource)
        if (proto) { return proto }
        throw new Error('plugin ' + plugin + ' does not provide resource: ' + resource)
      })
    }

    registerPrototype<T extends Obj> (id: Resource<T>, proto: T): void {
      if (this.prototypes.get(id)) { throw new Error('prototype ' + id + ' already registered') }
      this.prototypes.set(id, proto)
    }

    getSession () { return this.session }

    // U T I L I T Y

    async getClassHierarchy (_class: Ref<Class<Obj>>): Promise<Ref<Class<Obj>>[]> {
      const result = [] as Ref<Class<Obj>>[]
      let clazz = _class as Ref<Class<Obj>> | undefined
      while (clazz) {
        result.push(clazz)
        const instance = await this.getSession().getInstance(clazz)
        clazz = instance._extends
      }
      return result.reverse()
    }
  }

  const session = new TSession(platform, deps.db)
  const plugin = new TCorePlugin(platform, session)

  plugin.registerPrototype(core.native.Emb, TEmb.prototype)
  plugin.registerPrototype(core.native.Doc, TDoc.prototype)

  plugin.registerPrototype(core.native.Type, TType.prototype)
  plugin.registerPrototype(core.native.BagOf, TBagOf.prototype)
  plugin.registerPrototype(core.native.ArrayOf, TArrayOf.prototype)
  plugin.registerPrototype(core.native.InstanceOf, TInstanceOf.prototype)

  plugin.registerPrototype(core.native.StructuralFeature, TStructuralFeature.prototype)
  plugin.registerPrototype(core.native.Class, TClass.prototype)
  plugin.registerPrototype(core.native.Struct, TStruct.prototype)

  return plugin
}
