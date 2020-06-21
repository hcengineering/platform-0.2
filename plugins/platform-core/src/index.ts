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

import {
  plugin, Plugin, Service, Resource, Metadata,
  ResourceKind, Obj, Doc, Ref, Class, Emb, Property
} from '@anticrm/platform'

import { ModelDb, Layout, LayoutType } from '@anticrm/memdb'
import rpc from '@anticrm/platform-rpc'
import { CommitInfo } from '@anticrm/rpc'

export { Obj, Doc, Ref, Class, Emb, Property } from '@anticrm/platform'

// P R O P E R T I E S

/** 
 * When we define class, we do not define storage types. E.g. some property may
 * serialize to string, another to number or structure. Howerver we preserve
 * `runtime` types for a property. 
 * 
 * @typeParam T   Property will be of type `T` when instantiated.
 * 
 * {@link Instance}
 */
// export type Property<T> = { __property: T }

// export type Ref<T extends Doc> = string & { __ref: T } & Resource<T>
export type PropertyType = Property<any>
  | Emb
  | undefined
  | PropertyType[]
  | { [key: string]: PropertyType }

export type Resolve<T> = T extends Resource<infer X> ? Property<Promise<X>> : never
// export type Preserve<T> = T extends Resource<infer X> ? Property<Resource<X>> : never

// P R I M I T I V E

// export type Primitive<T> = T & Property<T>

// O B J E C T S

// export interface Obj { _class: Ref<Class<Obj>> }
// export interface Emb extends Obj { __embedded: true }
// export interface Doc extends Obj {
//   _id: Ref<Doc>
//   _mixins?: Ref<Class<Doc>>[]
// }

// T Y P E S

export type Exert<A> = (value: LayoutType, layout?: any, key?: string) => A
export interface Type<A> extends Emb {
  _default?: Property<A>
  exert?: Property<(this: Instance<Type<any>>) => Promise<Exert<A>>>
}
export interface RefTo<T extends Doc> extends Type<T> { to: Ref<Class<T>> }
export interface InstanceOf<T extends Emb> extends Type<T> { of: Ref<Class<T>> }
export interface BagOf<A> extends Type<{ [key: string]: A }> {
  of: Type<A>
}
export interface ArrayOf<A> extends Type<A[]> { of: Type<A> }
export interface StaticResource<T> extends Type<T> { }

// C L A S S E S

// type PropertyTypes<T> = {
//   [P in keyof T]:
//   T[P] extends Property<infer X> ? Type<X> :
//   T[P] extends Ref<infer X> ? Type<X> :
//   T[P] extends { [key: string]: infer X } | undefined ? BagOf<any> :
//   T[P] extends (infer X)[] | undefined ? ArrayOf<any> :
//   T[P]
// }

// export type Attributes<T extends E, E extends Obj> = PropertyTypes<Required<Omit<T, keyof E>>>
// export type AllAttributes<T extends E, E extends Obj> = Attributes<T, E> & Partial<Attributes<E, Obj>>

// export interface EClassifier<T extends E, E extends Obj> extends Doc {
//   _attributes: AllAttributes<T, E>
// }

export enum CoreDomain {
  Model = 'model'
}

// export interface EClass<T extends E, E extends Obj> extends EClassifier<T, E> {
//   _extends?: Ref<Class<E>>
//   _native?: Property<Object>
//   _domain?: Property<string>
// }

export const ClassKind = 'class' as ResourceKind
// export type Class<T extends Obj> = EClass<T, Obj>

type PrimitiveInstance<T> =
  T extends Ref<infer X> ? Ref<X> :
  // T extends Resource<infer X> & Resolve ? Promise<X> :
  // T extends Resource<infer X> ? X :
  T extends Property<infer X> ? X :
  Instance<T> // only Embedded objects remains

export type Instance<T> = { [P in keyof T]:
  T[P] extends Property<infer X> | undefined ? X :
  T[P] extends Ref<infer X> ? Ref<X> :
  T[P] extends { __embedded: true } ? Instance<T[P]> :
  T[P] extends { [key: string]: infer X } | undefined ? { [key: string]: Instance<X> } :
  T[P] extends (infer X)[] | undefined ? Instance<X>[] :
  never
} & {
  __layout: Layout<Obj>
  __update: Layout<Obj>
  getSession (): Session
}

export type Values<T> = { [P in keyof T]:
  T[P] extends Property<infer X> | undefined ? X :
  T[P] extends Ref<infer X> ? Ref<X> :
  T[P] extends { __embedded: true } ? Instance<T[P]> :
  T[P] extends { [key: string]: infer X } | undefined ? { [key: string]: Instance<X> } :
  T[P] extends (infer X)[] | undefined ? Instance<X>[] :
  never
}

// A D A P T E R S

export type AdapterType = (resource: Resource<any>) => Promise<Resource<any> | undefined>

export interface Adapter extends Doc {
  from: Property<string>
  to: Property<string>
  adapt: Property<Promise<AdapterType>>
}

// S E S S I O N

export interface Cursor<T extends Doc> {
  all (): Promise<Instance<T>[]>
}

export interface Session {
  newInstance<M extends Doc> (_class: Ref<Class<M>>, values: Values<Omit<M, keyof Doc>>, _id?: Ref<M>): Promise<Instance<M>>
  getInstance<T extends Doc> (id: Ref<T>): Promise<Instance<T>>
  as<T extends Doc, A extends Doc> (obj: Instance<T>, _class: Ref<Class<A>>): Promise<Instance<A>>
  is<T extends Doc, A extends Doc> (obj: Instance<T>, _class: Ref<Class<A>>): boolean
  find<T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>): Cursor<T>
  query<T extends Doc> (_class: Ref<Class<T>>, query: Values<Partial<T>>, listener: (result: Instance<T>[]) => void): () => void
  commit (): Promise<void>
  commitInfo (info: CommitInfo): void
  close (discard?: boolean): void

  adapt (resource: Resource<any>, kind: string): Promise<Resource<any> | undefined>

  instantiateEmb<T extends Emb> (obj: Layout<Obj>): Promise<Instance<T>>

  getModel (): ModelDb // TODO: need this?
  getClassHierarchy (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Ref<Class<Obj>>[]

  // debug?
  getPrototype<T extends Obj> (_class: Ref<Class<T>>, stereotype: number /* for tests */): Promise<Object>
}

export interface CoreService extends Service {
  newSession (): Session
}

// P L U G I N

export default plugin('core' as Plugin<CoreService>, { rpc: rpc.id }, {
  metadata: {
    WSHost: '' as Metadata<string>,
    WSPort: '' as Metadata<number>
  },
  class: {
    Doc: '' as Ref<Class<Doc>>,
    Class: '' as Ref<Class<Class<Obj>>>,
    StaticResource: '' as Ref<Class<StaticResource<any>>>,
    // Resource: '' as Ref<Class<Type<any>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    Adapter: '' as Ref<Class<Adapter>>
  },
  method: {
    Type_exert: '' as Resource<(this: Instance<Type<any>>) => Promise<Exert<any>>>,
    BagOf_exert: '' as Resource<(this: Instance<BagOf<any>>) => Promise<Exert<any>>>,
    InstanceOf_exert: '' as Resource<(this: Instance<InstanceOf<Emb>>) => Promise<Exert<any>>>,
    Metadata_exert: '' as Resource<(this: Instance<Type<Metadata<any>>>) => Promise<Exert<any>>>,
    Resource_exert: '' as Resource<(this: Instance<Type<any>>) => Promise<Exert<any>>>,

    // Adapter_adapt: '' as Resource<(this: Instance<Adapter>) => Promise<Resource<any>> | undefined>
  },
  native: {
    StaticResource: '' as Resource<Object>
  },
})
