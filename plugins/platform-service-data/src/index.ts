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

import { KeysByType, Required, AllRequired } from 'simplytyped'

import { PropType, AsString, Metadata } from '@anticrm/platform'
import { identify, PlatformService } from '@anticrm/platform'

export type AnyFunc = (...args: any[]) => any
//export type SysCall<M extends AnyFunc> = Metadata<M> //& { __sys_call: void }
export type Ref<T extends Doc> = AsString<T> & { __ref: void }

export type PropertyType = PropType<any> | Obj | { [key: string]: PropertyType }
export type Bag<X extends PropertyType> = Record<string, X>

export interface SessionProto<T extends Obj> {
  getSession(): Session
  getClass(): Instance<Class<T>>
}

type Transform<T extends Obj> = {
  [P in keyof T]:
  T[P] extends Obj ? Instance<T[P]> :
  T[P] extends (PropType<infer X> | undefined) ? X extends AnyFunc ? X : T[P] : T[P]
}
type RequireMethods<T extends object> = Required<T, KeysByType<Required<T, keyof T>, AnyFunc>>

export type Proto<T extends Obj> = RequireMethods<Transform<T>>
export type Layout<T extends Obj> = { __layout: T }
export type Instance<T extends Obj> = Proto<T> & Layout<T> & SessionProto<T>

// const x = {} as Instance<InstanceOf<Obj>>
// x.

// S E S S I O N

export type Query<T extends Doc> = Partial<T>

export interface Session extends PlatformService {
  getInstance<T extends Doc>(ref: Ref<T>): Instance<T>
  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T>[]
  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T> | undefined

  loadModel(docs: Doc[]): void

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T // FOR TESTS

  mixin<T extends Doc, E extends T>(doc: Ref<T>, mixin: Ref<Mixin<E>>): E
}

// M E T A M O D E L

type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never }
type FilterInternal<T> = Omit<T, 'xxxx'> //'_default' | '_class' | '_id'>

export type Descriptors<T> = AsDescrtiptors<AllRequired<FilterInternal<T>>>
export type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

const x = {} as DiffDescriptors<AnyType, Obj>
x

export interface Obj {
  _class: Ref<Class<this>>

  toIntlString?: PropType<(this: Instance<Obj>, plural?: number) => string>
}

export interface Doc extends Obj {
  _id: Ref<this>
}

export type Embedded = Obj //& PropType<Obj>

export interface Type<T extends PropertyType> extends Embedded {
  _default?: T
  exert?: AsString<(value: PropertyType) => any>
}
export type AnyType = Type<PropertyType>

export interface RefTo<T extends Doc> extends Type<Ref<T>> {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Embedded> extends Type<T> {
  of: Ref<Class<T>>
}

export interface BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
}

export interface Class<T extends Obj> extends Doc {
  attributes: Bag<Type<PropertyType>>
  native?: Metadata<Partial<Proto<T>>>
  extends?: Ref<Class<Obj>>
}

export interface Mixin<T extends Doc> extends Class<T> { }

export const pluginId = 'core'
export default identify(pluginId, {
  native: {
    Metadata: '' as Metadata<object>,
    RefTo: '' as Metadata<object>,
    Object: '' as Metadata<object>
  },
  method: {
    BagOf_excert: '' as Metadata<(this: Instance<AnyType>, value: PropertyType) => any>,
    InstanceOf_excert: '' as Metadata<(this: Instance<AnyType>, value: PropertyType) => any>,
  }
})
