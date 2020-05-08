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

import { Platform, Metadata } from '@anticrm/platform'
import { CorePlugin, Query, pluginId } from '.'
import core, {
  Obj, Doc, Ref, Bag, Class, Type, RefTo, SessionProto, Embedded,
  PropertyType, BagOf, InstanceOf, Mixin, ArrayOf, Container, Session, Content
} from '.'
import { TSession } from './session'

//////////

class TCorePlugin implements CorePlugin {

  readonly platform: Platform
  readonly pluginId = pluginId

  constructor(platform: Platform) {
    this.platform = platform
    // this.session = new TSession(this.platform)
  }

  // loadModel(docs: Container[]): void {
  //   this.session.loadModel(docs)
  // }

  newSession(): Session { return new TSession(this.platform) }
}

export default (platform: Platform): CorePlugin => {

  class TSessionProto {
    getSession(): Session { throw new Error('session provide the implementation') }
  }

  class TObj extends TSessionProto {
    _class!: Ref<Class<this>>
    getClass(): Class<this> { return this.getSession().getInstance(this._class, core.class.Class as Ref<Class<Class<this>>>) }
    toIntlString(plural?: number): string { return this.getClass().toIntlString(plural) }
  }

  class TType<T extends PropertyType> extends TObj implements Embedded {
    _default?: T
    exert(value: T, target?: PropertyType, key?: PropertyKey): any { return value ?? this._default }
    hibernate(value: any): T { return value }
  }

  // class TRefTo<T extends Doc> extends Type<Ref<T>> {
  //   to: Ref<Class<T>>
  //   constructor(to: Ref<Class<T>>, _default?: Ref<T>) {
  //     super(core.class.RefTo as Ref<Class<RefTo<T>>>, _default)
  //     this.to = to
  //   }
  // }

  class TInstanceOf<T extends Embedded> extends TType<T> {
    of!: Ref<Class<T>>
    exert(value: T) { return this.getSession().instantiateEmbedded(value) }
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

  class TBagOf<T extends PropertyType> extends TType<Bag<T>> {
    of!: Type<T>
    exert(value: Bag<T>) {
      return new Proxy(value, new BagProxyHandler(this.of))
    }
  }

  abstract class TDoc extends TObj implements Doc {
    _id!: Ref<this>
  }

  class ClassDocument<T extends Obj> extends TDoc implements Class<T> {
    _attributes!: Bag<Type<PropertyType>>
    _extends?: Ref<Class<Obj>>
    _native?: Metadata<T>
    toIntlString(plural?: number): string { return this._id }
  }

  platform.setMetadata(core.native.Object, TObj.prototype)
  // platform.setMetadata(core.native.RefTo, TRefTo.prototype)
  platform.setMetadata(core.native.Type, TType.prototype)
  platform.setMetadata(core.native.BagOf, TBagOf.prototype)
  platform.setMetadata(core.native.ArrayOf, TArrayOf.prototype)
  platform.setMetadata(core.native.InstanceOf, TInstanceOf.prototype)

  platform.setMetadata(core.native.ClassDocument, ClassDocument.prototype)

  return new TCorePlugin(platform)
}
