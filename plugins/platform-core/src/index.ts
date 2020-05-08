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
import { PropType, AsString, Metadata, identify, Plugin, PluginId } from '@anticrm/platform'

export type AnyFunc = (...args: any[]) => any
export type RemoveMethods<T extends object> = Omit<T, KeysByType<T, AnyFunc>>

type PrimitiveType = string
export type PropertyType = PrimitiveType
  | PropType<any>
  | Emb
  | { [key: string]: PropertyType }
  | PropertyType[]

export type Ref<T extends Doc> = AsString<T> & { __ref: void }
export type Bag<X extends PropertyType> = { [key: string]: X }

export type ContainerId = Ref<Doc>
export interface Container {
  _id: ContainerId
  _classes: Ref<Class<Obj>>[]
  [key: string]: PropertyType
}

// O B J E C T S

export interface Obj {
  _class: Ref<Class<this>>
  getSession(): Session
  getClass(): Class<this>
  toIntlString(plural?: number): string
}

export interface Emb extends Obj { }
export interface Doc extends Obj {
  _id: Ref<this>
}

// T Y P E S

export interface Type<T extends PropertyType> extends Emb {
  exert(value: T, target?: PropertyType, key?: PropertyKey): any
  hibernate(value: any): T
}
export type AnyType = Type<PropertyType>

export interface RefTo<T extends Doc> extends Type<Ref<T>> {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Emb> extends Type<T> {
  of: Ref<Class<T>>
}

export interface ArrayOf<T extends PropertyType> extends Type<T[]> {
  of: Type<T>
}

export interface BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
}

// C L A S S E S

export type Content<T extends Obj> = RemoveMethods<Omit<T, '_class'>>

export interface Class<T extends Obj> extends Doc {
  _attributes: Bag<Type<PropertyType>>
  _extends?: Ref<Class<Obj>>
  _native?: Metadata<T>
  newInstance(data: Content<T>): T
}

// S E S S I O N

export type Query<T extends Doc> = Partial<T>

type Clear<T> = RemoveMethods<Omit<T, '_class'>>
type AsDescrtiptors<T> = { [P in keyof T]: T[P] extends PropertyType ? Type<T[P]> : never }
type Descriptors<T extends object> = AsDescrtiptors<Required<Clear<T>>>
export type DiffDescriptors<T extends E, E> = Descriptors<Omit<T, keyof E>>

export interface Session {
  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T

  loadModel(docs: Container[]): void
  dump(): Container[]

  // Class Helpers
  getStruct<T extends Emb>(_struct: Ref<Class<T>>): Class<T>
  getClass<T extends Doc>(_class: Ref<Class<T>>): Class<T>
  createClass<T extends E, E extends Doc>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T>
  createStruct<T extends E, E extends Emb>(
    _id: Ref<Class<T>>, _extends: Ref<Class<E>>,
    _attributes: DiffDescriptors<T, E>, _native?: Metadata<T>): Class<T>
}

// C O R E  P L U G I N

export interface CorePlugin extends Plugin {
  getSession(): Session
}

export const pluginId = 'core' as PluginId<CorePlugin>

const core = identify(pluginId, {
  native: {
    Emb: '' as Metadata<Emb>,
    Doc: '' as Metadata<Doc>,

    Type: '' as Metadata<Type<PropertyType>>,
    BagOf: '' as Metadata<BagOf<PropertyType>>,
    ArrayOf: '' as Metadata<ArrayOf<PropertyType>>,
    InstanceOf: '' as Metadata<InstanceOf<Emb>>,

    Struct: '' as Metadata<Class<Emb>>,
    Class: '' as Metadata<Class<Doc>>,
  },
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    Struct: '' as Ref<Class<Class<Obj>>>,
  },
})

export default core
