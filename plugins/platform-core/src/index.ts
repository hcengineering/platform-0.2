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
export type Ref<T extends Doc> = AsString<T> & { __ref: void }

export type PropertyType = PropType<any> | Embedded | { [key: string]: PropertyType } | PropertyType[] | string

export type Bag<X extends PropertyType> = { [key: string]: X }

export type ContainerId = Ref<Doc>

export interface Container {
  _id: ContainerId
  _classes: Ref<Class<Obj>>[]
  [key: string]: PropertyType
}

// export const CurrentSession = 'core.currentSession' as Metadata<Session>

export interface SessionProto {
  getSession(): Session
}

export interface Obj extends SessionProto {
  _class: Ref<Class<this>>
  getClass(): Class<this>
  toIntlString(plural?: number): string
}

export interface Embedded extends Obj {
}

export interface Doc extends Obj {
  _id: Ref<this>
}

export interface Type<T extends PropertyType> extends Embedded {
  exert(value: T, target?: PropertyType, key?: PropertyKey): any
  hibernate(value: any): T
}

export type AnyType = Type<PropertyType>

export interface RefTo<T extends Doc> extends Type<Ref<T>> {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Embedded> extends Type<T> {
  of: Ref<Class<T>>
}

export interface ArrayOf<T extends PropertyType> extends Type<T[]> {
  of: Type<T>
}

export interface BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
}

// C L A S S E S  &  M I X I N S

export interface Class<T extends Obj> extends Doc {
  _attributes: Bag<Type<PropertyType>>
  _extends?: Ref<Class<Obj>>
  _native?: Metadata<T>
}

export interface Mixin<T extends Doc> extends Class<T> { }

export type Query<T extends Doc> = Partial<T>

export type RemoveMethods<T extends object> = Omit<T, KeysByType<T, AnyFunc>>
export type Content<T extends Doc> = RemoveMethods<Omit<T, '_class' | '__embedded'>>

export interface Session {
  getInstance<T extends Doc>(ref: Ref<T>, as: Ref<Class<T>>): T
  newInstance<T extends Doc>(_class: Ref<Class<T>>, data: Content<T>): T
  instantiateEmbedded<T extends Obj>(obj: T): T

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T[]
  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): T | undefined
}

// C O R E  P L U G I N

export interface CorePlugin extends Plugin {
  loadModel(docs: Container[]): void
  getSession(): Session
}

export const pluginId = 'core' as PluginId<CorePlugin>

const core = identify(pluginId, {
  native: {
    Object: '' as Metadata<Obj>,
    Type: '' as Metadata<Type<PropertyType>>,
    // RefTo: '' as Metadata<RefTo<Doc>>,
    BagOf: '' as Metadata<BagOf<PropertyType>>,
    ArrayOf: '' as Metadata<ArrayOf<PropertyType>>,
    InstanceOf: '' as Metadata<InstanceOf<Embedded>>,
    // Mixins: '' as Metadata<Type<PropertyType>>,
    ClassDocument: '' as Metadata<Class<Obj>>
  },
  class: {
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    ArrayOf: '' as Ref<Class<ArrayOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Embedded>>>,
  },
})

export default core
