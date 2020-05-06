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

import { KeysByType } from 'simplytyped'

import { PropType, AsString, Metadata } from '@anticrm/platform'
import { identify, Plugin, PluginId } from '@anticrm/platform'

export type AnyFunc = (...args: any[]) => any
export type Ref<T extends Doc> = AsString<T> & { __ref: void }

export type PropertyType = PropType<any> | Embedded | { [key: string]: PropertyType }
export type Bag<X extends PropertyType> = { [key: string]: X }

export class SessionProto {
  getSession(): CorePlugin { throw new Error('detached object') }
}

export abstract class Obj extends SessionProto {
  _class: Ref<Class<this>>
  protected constructor(_class: Ref<Class<Obj>>) {
    super()
    this._class = _class as Ref<Class<this>>
  }
  toIntlString(plural?: number): string {
    return this.getSession().getInstance(this._class).toIntlString(plural)
  }
}

export abstract class Doc extends Obj {
  _id: Ref<this>
  protected constructor(_class: Ref<Class<Doc>>, _id: Ref<Doc>) {
    super(_class)
    this._id = _id as Ref<this>
  }
}

export abstract class Embedded extends Obj {
  // __embedded!: void
}

export abstract class Type<T extends PropertyType> extends Embedded {
  _default?: T
  protected constructor(_class: Ref<Class<Type<T>>>, _default?: T) {
    super(_class)
    this._default = _default
  }
  abstract exert(value: T): any
}
export type AnyType = Type<PropertyType>

export class RefTo<T extends Doc> extends Type<Ref<T>> {
  to: Ref<Class<T>>
  constructor(to: Ref<Class<T>>, _default?: Ref<T>) {
    super(core.class.RefTo as Ref<Class<RefTo<T>>>, _default)
    this.to = to
  }
  exert(value: Ref<T>) { return value ?? this._default }
}

export class InstanceOf<T extends Embedded> extends Type<T> {
  of: Ref<Class<T>>
  constructor(of: Ref<Class<T>>, _default?: T) {
    super(core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, _default)
    this.of = of
  }
  exert(value: T) {
    return this.getSession().instantiate(value)
  }
}

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

export class BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
  constructor(of: Type<T>, _default?: Bag<T>) {
    super(core.class.BagOf as Ref<Class<BagOf<T>>>, _default)
    this.of = of
  }
  exert(value: Bag<T>) {
    return new Proxy(value, new BagProxyHandler(this.of))
  }
}

export class TypeMetadata<T> extends Type<Metadata<T>> {
  constructor(_default?: Metadata<T>) {
    super(core.class.Metadata, _default)
  }
  exert(value: Metadata<any>) {
    return value ?? this._default
    //return this.getSession().platform.getMetadata(value ?? this._default)
  }
}

type RemoveMethods<T extends object> = Omit<T, KeysByType<T, AnyFunc>>
type Clear<T> = RemoveMethods<Omit<T, '__embedded' | '_default'>>

type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never }
type Descriptors<T extends object> = AsDescrtiptors<Required<Clear<T>>>
type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

export class Class<T extends Obj> extends Doc {
  attributes: Bag<Type<PropertyType>>
  extends?: Ref<Class<Obj>>
  native?: Metadata<T>
  constructor(_class: Ref<Class<Class<T>>>, _id: Ref<Class<T>>, attributes: Bag<Type<PropertyType>>, _extends: Ref<Class<Obj>>, native?: Metadata<T>) {
    super(_class, _id)
    this.attributes = attributes
    this.extends = _extends
    this.native = native
  }
  static createClass<T extends E, E extends Obj>(_id: Ref<Class<T>>, _extends: Ref<Class<E>>, attributes: DiffDescriptors<T, E>, native?: Metadata<T>): Class<T> {
    return new Class(core.class.Class as Ref<Class<Class<T>>>, _id, attributes, _extends, native)
  }
}

// C O R E  P L U G I N

export type Query<T extends Doc> = Partial<T>

export interface CorePlugin extends Plugin {
  getInstance<T extends Doc>(ref: Ref<T>): T
  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T
  instantiate<T extends Obj>(obj: T): T

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[]
  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined

  loadModel(docs: Doc[]): void
  // mixin<T extends Doc, E extends T>(doc: Ref<T>, mixin: Ref<Mixin<E>>): E
}

export const pluginId = 'core' as PluginId<CorePlugin>

const core = identify(pluginId, {
  native: {
    Object: '' as Metadata<Obj>,
    Metadata: '' as Metadata<TypeMetadata<any>>,
    RefTo: '' as Metadata<RefTo<Doc>>,
    BagOf: '' as Metadata<BagOf<PropertyType>>,
    InstanceOf: '' as Metadata<InstanceOf<Embedded>>,
  },
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Embedded>>>,
    Metadata: '' as Ref<Class<Type<Metadata<any>>>>,
  },
})

export default core
