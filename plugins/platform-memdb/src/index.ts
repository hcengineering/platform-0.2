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

export interface Obj { _class: Ref<Class<this>> }
export interface Emb extends Obj { __property: this }
export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}
export interface Type<A> extends Emb {
  _default?: Property<A>
  exert?: Property<(value: Property<any>) => any>
}
// export interface Identity extends Type<(value: Property<any>) => any> { }
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
  T[P] extends { [key: string]: Property<infer X> } ? Type<{ [key: string]: X }> :
  T[P] extends Property<infer X>[] ? Type<X[]> :
  never
}
export type Attributes<T extends E, E extends Obj> = PropertyTypes<Required<Omit<T, keyof E>>>

export interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: Attributes<T, E>
  _overrides?: Partial<Attributes<T, Obj>>
  _extends?: Ref<Class<Obj>>
}

export type Class<T extends Obj> = EClass<T, Obj>

//////

export type Instance<T extends Obj> = { [P in keyof T]:
  T[P] extends Property<infer X> ? X :
  T[P] extends Property<infer X> | undefined ? X :
  T[P] extends { [key: string]: Property<infer X> } ? { [key: string]: X } :
  T[P] extends Property<infer X>[] ? X[] :
  never
}

export interface CoreService extends Service {

  // -- Here is a single fundamental signature: `mixin`:
  // mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 

  // newInstance       <M        extends       Obj>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Obj>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newDocument       <M        extends       Doc>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Doc>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newClass
  //     newClass === newInstance, where M === EClass<T, E> // clazz: Ref<Class<EClass<T, E>>>,

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M

  newInstance<M extends Emb> (clazz: Ref<Class<M>>, values: Omit<M, keyof Emb>): M

  newDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M>
  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): Instance<EClass<T, E>>

  loadDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): M
  loadClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E>
}

const core = plugin('core' as Plugin<CoreService>, {}, {
  class: {
    Class: '' as Ref<Class<Class<Obj>>>,
    // Identity: '' as Ref<Class<Identity>>,
    ResourceType: '' as Ref<Class<ResourceType<any>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
  }
})

export default core


// const x = {} as Class<InstanceOf<Emb>>

// x._attributes

// const z = {} as Instance<Class<InstanceOf<Emb>>>

// z._attributes.
