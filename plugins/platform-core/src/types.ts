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

import { KeysByType, AnyFunc } from 'simplytyped'

import { IntlStringId } from './i18n'
import { Extension, identify } from './extension'

export type PropertyType = undefined | Extension<any> | Ref<Doc> | IntlStringId | Embedded | { [key: string]: PropertyType }
// type MethodType = (...args: any[]) => any
type DocId = string

export interface Bag<T extends PropertyType> { [key: string]: T }
export type Ref<T extends Doc> = DocId & { __ref: T }

export type Layout<T extends Obj> = Omit<T, KeysByType<T, AnyFunc>>

// S E R I A L I Z E D

type AsNumber<T> = number | { __as_number: T }
// interface Struct { __struct: void }

// S E S S I O N

export type Query<T extends Doc> = Partial<T>

export interface Session {
  getInstance<T extends Doc>(ref: Ref<T>): T

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[]
  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined
}

// M E T A M O D E L

export interface Obj {
  _class: Ref<Class<this>>

  getSession(): Session
  getClass(): Class<this>

  toIntlString(plural?: number): string
}

export interface Embedded extends Obj {
  __embedded?: void
}

export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Obj[]

  as<T extends Obj>(mixin: Ref<Mixin<T>>): T
  mixin<T extends Obj>(doc: Doc, mixin: Ref<Mixin<T>>): T
}

export interface Type extends Embedded { }

export type Konstructor<T extends Obj> = new () => T

export interface Class<T extends Obj> extends Doc {
  // label: IntlStringId
  konstructor?: Extension<Konstructor<T>>
  extends?: Ref<Class<Obj>>
  attributes?: Bag<Type>
}

export interface Mixin<T extends Obj> extends Class<T> { }

export interface BusinessObject extends Doc {
  createdOn: AsNumber<Date>
}

export const pluginId = 'core'

export default identify(pluginId, {
  class: {
    Object: '' as Ref<Class<Obj>>,
    Doc: '' as Ref<Class<Doc>>,
    Class: '' as Ref<Class<Class<Obj>>>
  }
})
