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

import { Platform, Metadata } from '@anticrm/platform'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, Emb,
  PropertyType, BagOf, Content, CorePlugin, DiffDescriptors
} from '.'
import { TSession, SessionProto, Konstructor, Layout } from './session'

//////////

console.log('PLUGIN: parsed core')

export default (platform: Platform): CorePlugin => {

  console.log('PLUGIN: started core')

  class TCorePlugin implements CorePlugin {

    readonly platform: Platform
    readonly pluginId = core.id

    private session: TSession

    constructor(platform: Platform, session: TSession) {
      this.platform = platform
      this.session = session
    }

    getSession() { return this.session }
  }

  class TSessionProto implements SessionProto {
    getSession(): TSession { throw new Error('session provide the implementation') }
    __mapKey(_class: Ref<Class<Obj>>, key: string): string | null { return null }
  }

  class TEmb extends TSessionProto implements Emb {
    _class!: Ref<Class<this>>
    toIntlString(plural?: number): string { return this.getClass().toIntlString(plural) }
    getClass(): Class<this> {
      return this.getSession().getInstance(this._class)
    }

    __mapKey(_class: Ref<Class<Obj>>, key: string) { return key }
  }

  class TDoc extends TSessionProto implements Doc {
    _class!: Ref<Class<this>>
    _id!: Ref<this>
    toIntlString(plural?: number): string { return this.getClass().toIntlString(plural) }
    getClass(): Class<this> {
      return this.getSession().getInstance(this._class)
    }

    as<T extends Doc>(_class: Ref<Class<T>>): T | undefined {
      return this.getSession().as(this as unknown as Layout<Doc>, _class)
    }
    mixins(): Ref<Class<Doc>>[] {
      const layout = this as unknown as Layout<Doc>
      return layout.__layout._classes as Ref<Class<Doc>>[]
    }

    __mapKey(_class: Ref<Class<Obj>>, key: string) { return key.startsWith('_') ? key : _class + ':' + key }
  }

  // T Y P E S 

  class TType<T extends PropertyType> extends TEmb implements Type<T> {
    _default?: T
    exert(value: T, target?: PropertyType, key?: PropertyKey): any { return value ?? this._default }
    hibernate(value: any): T { return value }
  }

  class TInstanceOf<T extends Emb> extends TType<T> {
    of!: Ref<Class<T>>
    exert(value: T) {
      if (typeof value === 'object')
        return this.getSession().instantiate(value._class, value)
      return undefined
    }
  }

  // C O L L E C T I O N S : A R R A Y

  class ArrayProxyHandler implements ProxyHandler<PropertyType[]> {
    private type: Type<PropertyType>

    constructor(type: Type<PropertyType>) {
      this.type = type
    }

    get(target: PropertyType[], key: PropertyKey): any {
      const value = Reflect.get(target, key)
      return this.type.exert(value)
    }
  }

  class TArrayOf<T extends PropertyType> extends TType<T[]> {
    of!: Type<T>
    exert(value: T[]) {
      return new Proxy(value, new ArrayProxyHandler(this.of))
    }
  }

  // C O L L E C T I O N S : B A G

  class BagProxyHandler implements ProxyHandler<Bag<PropertyType>> {
    private type: Type<PropertyType>

    constructor(type: Type<PropertyType>) {
      this.type = type
    }

    get(target: Bag<PropertyType>, key: string): any {
      const value = Reflect.get(target, key)
      return this.type.exert(value)
    }
  }

  class TBagOf<T extends PropertyType> extends TType<Bag<T>> implements BagOf<T> {
    of!: Type<T>
    exert(value: Bag<T>) {
      if (typeof value === 'object')
        return new Proxy(value, new BagProxyHandler(this.of))
      return undefined
    }
  }

  // S T R U C T U R A L  F E A T U R E S

  abstract class TStructuralFeature<T extends Obj> extends TDoc implements Class<T> {
    _attributes!: Bag<Type<PropertyType>>
    _extends?: Ref<Class<Obj>>
    _native?: Metadata<T>

    abstract createConstructor(): Konstructor<T>

    newInstance(data: Content<T>): T {
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
    toIntlString(plural?: number): string { return 'struct: ' + this._id }

    createConstructor(): Konstructor<T> {
      const session = this.getSession()
      const _class = this._id
      return data => {
        const instance = session.instantiate(_class, data) as Layout<T>
        Object.assign(instance, data)
        instance.__layout._class = _class
        return instance as T
      }
    }
  }

  class TClass<T extends Doc> extends TStructuralFeature<T> {
    toIntlString(plural?: number): string { return 'doc: ' + this._id }

    createConstructor(): Konstructor<T> {
      const session = this.getSession()
      const _class = this._id as Ref<Class<T>>
      return data => session.createDocument(_class, data)
    }
  }

  platform.setMetadata(core.native.Emb, TEmb.prototype)
  platform.setMetadata(core.native.Doc, TDoc.prototype)

  platform.setMetadata(core.native.Type, TType.prototype)
  platform.setMetadata(core.native.BagOf, TBagOf.prototype)
  platform.setMetadata(core.native.ArrayOf, TArrayOf.prototype)
  platform.setMetadata(core.native.InstanceOf, TInstanceOf.prototype)

  platform.setMetadata(core.native.StructuralFeature, TStructuralFeature.prototype)
  platform.setMetadata(core.native.Class, TClass.prototype)
  platform.setMetadata(core.native.Struct, TStruct.prototype)

  // B O O T  S E S S I O N

  const session = new TSession(platform)
  return new TCorePlugin(platform, session)
}
