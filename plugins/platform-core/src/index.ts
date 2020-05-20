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

import { plugin, Plugin, Service, Resource } from '@anticrm/platform'

/** This is the only allowed type for an object property */
export interface Property<T> { __property: T }

/** Object property serialized as String */
export type StringProperty<T> = string & Property<T>
/** Object property serialized as Number */
export type NumberProperty<T> = number & Property<T>

export type ResourceProperty<T> = Property<T> & Resource<T>

export type Ref<T> = StringProperty<T> & { __ref: true }

export type PropertyType = Property<any>
  | Emb
  | undefined
  | PropertyType[]
  | { [key: string]: PropertyType }

export interface Obj { _class: Ref<Class<this>> }
export interface Emb extends Obj { __embedded: this }
export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}
export interface Type<A> extends Emb {
  _default?: Property<A>
  exert?: Property<(this: Instance<Type<any>>, value: PropertyType) => any>
}
export interface RefTo<T extends Doc> extends Type<T> { to: Ref<Class<T>> }
export interface InstanceOf<T extends Emb> extends Type<T> { of: Ref<Class<T>> }
export interface BagOf<A> extends Type<{ [key: string]: A }> {
  of: Type<A>
}
export interface ArrayOf<A> extends Type<A[]> { of: Type<A> }
export interface ResourceType<T> extends Type<T> { }

/////

type PropertyTypes<T> = { [P in keyof T]:
  T[P] extends Property<infer X> ? Type<X> :
  T[P] extends { __embedded: infer X } ? (X extends Emb ? X : never) :
  T[P] extends { [key: string]: Property<infer X> } ? Type<{ [key: string]: X }> :
  T[P] extends Property<infer X>[] ? Type<X[]> :
  never
}
export type Attributes<T extends E, E extends Obj> = PropertyTypes<Required<Omit<T, keyof E>>>

export interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: Attributes<T, E> & Partial<Attributes<E, Obj>>
  _extends?: Ref<Class<Obj>>
  _native?: ResourceProperty<Object>
}

export type Class<T extends Obj> = EClass<T, Obj>

//////

export type Instance<T extends Obj> = { [P in keyof T]:
  T[P] extends Property<infer X> ? X :
  T[P] extends Property<infer X> | undefined ? X :
  T[P] extends { __embedded: infer X } ? (X extends Obj ? Instance<X> : never) :
  T[P] extends { [key: string]: Property<infer X> } ? { [key: string]: X } :
  T[P] extends Property<infer X>[] ? X[] :
  never
} & { __layout: T }

/** 
  -- Here is a single fundamental signature: `mixin`:
    
  // mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 

  Below are convenient API calls for `new` operation, depending on base class of an object being created

  // newInstance       <M        extends       Obj>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Obj>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newDocument       <M        extends       Doc>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Doc>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newClass
  //     newClass === newInstance, where M === EClass<T, E> // clazz: Ref<Class<EClass<T, E>>>,
*/
export interface CoreService extends Service {

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M

  newInstance<M extends Emb> (clazz: Ref<Class<M>>, values: Omit<M, keyof Emb>): M

  newDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M>
  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): Instance<EClass<T, E>>

  createDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): M
  createClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E>
}

export default plugin('core' as Plugin<CoreService>, {}, {
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    ResourceType: '' as Ref<Class<ResourceType<any>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
  },
  method: {
    Type_exert: '' as ResourceProperty<(this: Instance<Type<any>>, value: PropertyType) => any>,
    BagOf_exert: '' as ResourceProperty<(this: Instance<BagOf<any>>, value: { [key: string]: PropertyType }) => any>,
    InstanceOf_exert: '' as ResourceProperty<(this: Instance<InstanceOf<any>>, value: Emb) => Instance<Emb>>,
  },
  native: {
    ResourceType: '' as ResourceProperty<Object>
  }
})


