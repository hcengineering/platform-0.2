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

import { plugin, Plugin, Service, Resource, Property, Metadata } from '@anticrm/platform'

// P R O P E R T I E S

export type Ref<T> = string & { __ref: T }
export type PropertyType = Property<any>
  | Emb
  | undefined
  | PropertyType[]
  | { [key: string]: PropertyType }

// O B J E C T S

export interface Obj { _class: Ref<Class<this>> }
export interface Emb extends Obj { __embedded: true }
export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}

// T Y P E S

export type Exert = (value: PropertyType, layout?: any, key?: string) => any
export interface Type<A> extends Emb {
  _default?: Property<A>
  exert?: Property<(this: Instance<Type<any>>) => Exert>
}
export interface RefTo<T extends Doc> extends Type<T> { to: Ref<Class<T>> }
export interface InstanceOf<T extends Emb> extends Type<T> { of: Ref<Class<T>> }
export interface BagOf<A> extends Type<{ [key: string]: A }> {
  of: Type<A>
}
export interface ArrayOf<A> extends Type<A[]> { of: Type<A> }
export interface ResourceType<T> extends Type<T> { }

// P R I M I T I V E

export type StringType = Property<string> // TODO: Do we need this?

// C L A S S E S

type PrimitiveType<T> =
  T extends Property<infer X> ? Type<X> :
  T

type PropertyTypes<T> = { [P in keyof T]:
  T[P] extends Ref<infer X> ? Type<X> :
  T[P] extends { [key: string]: infer X } | undefined ? BagOf<any> :
  T[P] extends (infer X)[] | undefined ? ArrayOf<any> :
  PrimitiveType<T[P]>
}

export type Attributes<T extends E, E extends Obj> = PropertyTypes<Required<Omit<T, keyof E>>>
export type AllAttributes<T extends E, E extends Obj> = Attributes<T, E> & Partial<Attributes<E, Obj>>

export interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: AllAttributes<T, E>
  _extends?: Ref<Class<E>>
  _native?: Resource<Object>
}

export type Class<T extends Obj> = EClass<T, Obj>

type PrimitiveInstance<T> =
  T extends Ref<infer X> ? Ref<X> : // (X extends Doc ? Promise<Instance<X>> : never) :
  T extends Resource<infer X> ? Promise<X> :
  T extends Property<infer X> ? X :
  Instance<T> // only Embedded objects remains

export type Instance<T> = { [P in keyof T]:
  T[P] extends { [key: string]: infer X } | undefined ? { [key: string]: PrimitiveInstance<X> } :
  T[P] extends (infer X)[] | undefined ? PrimitiveInstance<X>[] :
  PrimitiveInstance<T[P]>
} & {
  __layout: T
  getSession (): CoreService
}

const x = {} as Instance<BagOf<Obj>>
x.of

const y = {} as Instance<Class<Obj>>
y._attributes


// S E S S I O N

export interface DocDb {
  add (doc: Doc): void
  get<T extends Doc> (id: Ref<T>): T
  dump (): Doc[]

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Pick<T, Exclude<keyof T, keyof E>>): void
  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Doc>, _id?: Ref<M>): M
}

export interface CoreService extends Service {
  // newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Omit<M, keyof Obj>, _id?: Ref<M>): Instance<M>

  getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>>
  as<T extends Doc, A extends Doc> (obj: Instance<T>, _class: Ref<Class<A>>): Instance<A>
  is<T extends Doc, A extends Doc> (obj: Instance<T>, _class: Ref<Class<A>>): boolean
  getClassHierarchy (_class: Ref<Class<Obj>>): Ref<Class<Obj>>[]

  getDb (): DocDb

  // debug?
  getPrototype<T extends Obj> (_class: Ref<Class<T>>, stereotype: number /* for tests */): Object
}

// P L U G I N

export default plugin('core' as Plugin<CoreService>, {}, {
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    ResourceType: '' as Ref<Class<ResourceType<any>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
  },
  method: {
    Type_exert: '' as Resource<(this: Instance<Type<any>>) => Exert>,
    BagOf_exert: '' as Resource<(this: Instance<BagOf<any>>) => Exert>,
    InstanceOf_exert: '' as Resource<(this: Instance<InstanceOf<Emb>>) => Exert>,
    Metadata_exert: '' as Resource<(this: Instance<Type<Metadata<any>>>) => Exert>,
  },
  native: {
    ResourceType: '' as Resource<Object>
  },
})


