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

// import { KeysByType, AnyFunc } from 'simplytyped'

import { PropType, AsNumber, AsString } from '@anticrm/platform'
import { identify, PlatformService } from '@anticrm/platform'

type DocId = string

export type PropertyType = PropType<any>// PropType<any> | Obj | { [key: string]: PropertyType } | undefined


type A<T> = {
  [P in keyof T]: T[P] extends PropType<any> ? Type<T[P]> : never
}

type R<T> = A<Required<T>>

const o = {} as Obj

const x = {} as R<Obj>

// export type Bag<T extends PropertyType> = { [key: string]: T } & PropType<Record<string, T>>

export type Bag<X extends PropertyType> = Record<string, X> & PropType<Record<string, X>>

export type Ref<T extends Doc> = AsString<T> & { __ref: void }

// export type Layout<T extends Obj> = Omit<T, KeysByType<T, AnyFunc>>

export interface InstanceIntf<T extends Obj> {
  getSession(): Session
  getClass(): Instance<Class<T>>
}

export type Instance<T extends Obj> = T & InstanceIntf<T>

// S E S S I O N

export type Query<T extends Doc> = Partial<T>

export interface Session extends PlatformService {
  getInstance<T extends Doc>(ref: Ref<T>): Instance<T>
  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[]
  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined

  mixin<T extends Doc, E extends T>(doc: Ref<T>, mixin: Ref<Mixin<E>>): E
}

// M E T A M O D E L

export interface Obj {
  _class: Ref<Class<this>>

  toIntlString?: PropType<(this: Obj, plural?: number) => string>
}

export interface Doc extends Obj {
  _id: Ref<this>
  // _mixins?: Obj[] // Hide?

  // as<T extends this>(mixin: Ref<Mixin<T>>): T
  // mixin<T extends this>(mixin: Ref<Mixin<T>>): T
}

export type Embedded = Obj & PropType<Obj>

export interface Type<T extends PropertyType> extends Embedded {
  _default?: T
}

export interface RefTo<T extends Doc> extends Type<Ref<T>> {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Embedded> extends Type<T> {
  of: Ref<Class<T>>
}

export interface BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
}

export type Konstructor<T extends Obj> = new () => T

export interface Class<T extends Obj> extends Doc {
  // label: IntlString
  // konstructor?: Extension<Konstructor<T>>
  extends?: Ref<Class<Obj>>
  attributes: Bag<Type<PropertyType>>
}

export interface Mixin<T extends Doc> extends Class<T> { }

export interface BusinessObject extends Doc {
  createdOn: AsNumber<Date>
}

export const pluginId = 'core'

export default identify(pluginId, {
  method: {
  },
  class: {
    Object: '' as Ref<Class<Obj>>,
    Class: '' as Ref<Class<Class<Obj>>>,
  }
})



