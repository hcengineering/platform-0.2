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

import core, { Session, Obj, Ref, Class, PropertyType, Type, RefTo, Doc, Bag, BagOf, Embedded, InstanceOf } from '..'
import { Metadata } from '@anticrm/platform'
import { MemSession } from './service'

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

class TSession {
  getSession(): Session { throw new Error('not implemented') }
}

export class TObj extends TSession {
  _class: Ref<Class<this>>
  constructor(_class: Ref<Class<Obj>>) {
    super()
    this._class = _class as Ref<Class<this>>
  }
  toIntlString(plural?: number): string {
    return this.getSession().getInstance(this._class).toIntlString(plural)
  }
}

abstract class TType<T extends PropertyType> extends TObj implements Type<T> {
  _default?: T
  constructor(_class: Ref<Class<Type<T>>>, _default?: T) {
    super(_class)
    this._default = _default
  }
  abstract exert(value: T): any
}

export class TRefTo<T extends Doc> extends TType<Ref<T>> implements RefTo<T> {
  to: Ref<Class<T>>
  constructor(to: Ref<Class<T>>, _default?: Ref<T>) {
    super(core.class.RefTo, _default)
    this.to = to
  }
  exert(value: Ref<T>) { return value ?? this._default }
}

export class TMetadata<T> extends TType<Metadata<T>> {
  constructor(_default?: Metadata<T>) {
    super(core.class.Metadata, _default)
  }
  exert(value: Metadata<any>) {
    const session = this.getSession() as MemSession
    return session.platform.getMetadata(value ?? this._default)
  }
}

export class TBagOf<T extends PropertyType> extends TType<Bag<T>> implements BagOf<T> {
  of: Type<T>
  constructor(of: Type<T>, _default?: Bag<T>) {
    super(core.class.BagOf, _default)
    this.of = of
  }
  exert(value: Bag<T>) {
    return new Proxy(value, new BagProxyHandler(this.of))
  }
}

export class TInstanceOf<T extends Embedded> extends TType<T> implements InstanceOf<T> {
  of: Ref<Class<T>>
  constructor(of: Ref<Class<T>>, _default?: T) {
    super(core.class.InstanceOf, _default)
    this.of = of
  }
  exert(value: T): any {
    const session = this.getSession() as MemSession
    return session.instantiate(value)
  }
}

export abstract class TDoc extends TObj {
  _id: Ref<this>
  protected constructor(_class: Ref<Class<Doc>>, _id: Ref<Doc>) {
    super(_class)
    this._id = _id as Ref<this>
  }
}

type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? TType<T[P]> : never }
type Descriptors<T extends object> = AsDescrtiptors<Required<T>>
type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

export class TClass<T extends Obj> extends TDoc {
  attributes: Bag<Type<PropertyType>>
  protected constructor(_id: Ref<Class<T>>, attributes: Bag<Type<PropertyType>>) {
    super(core.class.Class, _id)
    this.attributes = attributes
  }
}

function createClass<T extends E, E extends object>(attributes: DiffDescriptors<T, E>) {

}



// type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? H<Type<T[P]>> : never }

// export type Descriptors<T extends object> = AsDescrtiptors<AllRequired<H<T>>>
// export type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>



// const attributes: Descriptors<Obj> = {
//   _class: ref(core.class.Class),
// }

// const objectClass: H<Class<Obj>> = {
//   _class: core.class.Class,
//   _id: core.class.Object,
//   native: core.native.Object,
//   attributes: attributes as unknown as { [key: string]: Type<PropertyType> }
// }
