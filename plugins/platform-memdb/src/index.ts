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

import { plugin, AnyPlugin } from '@anticrm/platform'

/** This is the only allowed type for an object property */
type Property<T> = { __property: T }

/** Object property serialized as String */
type StringProperty<T> = string & Property<T>
/** Object property serialized as Number */
type NumberProperty<T> = number & Property<T>

export type PropertyType = Property<any> | undefined

type Str = StringProperty<string>

type Resource<T> = { __resource: T }

export type Ref<T> = StringProperty<T> & { __ref: true }

type Bag<T extends PropertyType> = { [key: string]: T } // & Property<{ [key: string]: T }>

export interface Obj {
  _class: Ref<Class<this>>
}

export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}

export interface Type<T> extends Obj {
  exert?: Resource<(value: PropertyType) => T>
}

export interface RefTo<T extends Doc> extends Type<T> {
  to: Ref<Class<Doc>>
}

export interface BagOf<T extends PropertyType> extends Type<Bag<T>> {
  of: Type<T>
}

export interface InstanceOf<T extends Obj> extends Type<T> {
  of: Ref<Class<T>>
}

/////

type PropertyTypes<T> = { [P in keyof T]:
  T[P] extends Property<infer X> ? Type<X> :
  T[P] extends { [key: string]: PropertyType } ? Type<Bag<PropertyType>> :
  never
}
export type Attributes<T extends E, E extends Obj> = PropertyTypes<Omit<T, keyof E>>

export interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: Attributes<T, E>
}

export type Class<T extends Obj> = EClass<T, Obj>

//////

export type Instance<T extends Obj> = { [P in keyof T]:
  T[P] extends Property<infer X> ? X :
  T[P] extends { [key: string]: PropertyType } ? Bag<PropertyType> :
  never
}

// const zzz = {} as Instance<Class<Obj>>
// zzz._attributes

export interface Session {
  // -- Here is a single fundamental signature: `mixin`:
  // mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 

  // newInstance       <M        extends       Obj>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Obj>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newDocument       <M        extends       Doc>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Doc>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newClass
  //     newClass === newInstance, where M === EClass<T, E> // clazz: Ref<Class<EClass<T, E>>>,

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M
  newInstance<M extends Obj> (clazz: Ref<Class<M>>, values: Omit<M, keyof Obj>): M
  newDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M>
  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E>
}


// interface Person extends Doc {
//   firstName: Str
//   lastName: Str
// }

const core = plugin('core' as AnyPlugin, {}, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Doc: '' as Ref<Class<Doc>>,
    Class: '' as Ref<Class<Class<Obj>>>,
    // Person: '' as Ref<Class<Person>>,
    Type: '' as Ref<Class<Type<PropertyType>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<PropertyType>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Obj>>>
  }
})

export default core

const S = {} as Session

const classObj = S.newClass<Obj, Obj>({
  _id: '' as Ref<Class<Obj>>,
  _attributes: {}
})

const classDoc = S.newClass<Doc, Obj>({
  _id: '' as Ref<Class<Doc>>,
  _attributes: {
    _id: S.newInstance(core.class.RefTo, {
      to: core.class.Doc,
    })
  }
})

const fff = S.newInstance(core.class.InstanceOf, { of: core.class.Type })

const classClass = S.newClass<Class<Obj>, Doc>({
  _id: '' as Ref<Class<Class<Obj>>>,
  _attributes: {
    _attributes: S.newInstance(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }
})



// const x = {} as EClass<Person, Doc>

// x._attributes.firstName

// const y = {} as Class<Class<Obj>>

// const refPerson = '' as Ref<Class<Person>>
// const refClassClass = '' as Ref<Class<EClass<Person, Doc>>> (!)
// const refTypeString = '' as Ref<Class<Type<string>>>

// const S = {} as Session

// const z = S.newInstance(refPerson, { firstName: 'John' as Str, lastName: 'Carmack' as Str, _id: '' as Ref<Person> })
// const v = S.newInstance(refClassClass, {
//   _attributes: {
//     firstName: S.newInstance(refTypeString, {}),
//     lastName: S.newInstance(refTypeString, {})
//   }
// })

//////

// export const metaModel = [
//   newContainer(core.class.Class, {
//     _id: core.class.Emb,
//     _native: core.native.Emb,
//     _attributes: {}
//   }),
//   newContainer(core.class.Class, {
//     _id: core.class.Doc,
//     _native: core.native.Doc,
//     _attributes: {
//       _id: ref(core.class.Doc)
//     }
//   }),
//   createStruct(core.class.Type, core.class.Emb, {}, core.native.Type),
//   createStruct(core.class.Resource, core.class.Type, {}, core.native.Type),
//   createStruct(core.class.Metadata, core.class.Type, {}, core.native.Type),
//   createStruct(core.class.String, core.class.Type, {}, core.native.Type),

//   createStruct(core.class.RefTo, core.class.Type, {
//     to: ref(core.class.Class)
//   }, core.native.Type),
//   createStruct(core.class.BagOf, core.class.Type, {
//     of: obj(core.class.Type)
//   }, core.native.BagOf),
//   createStruct(core.class.ArrayOf, core.class.Type, {
//     of: obj(core.class.Type)
//   }, core.native.ArrayOf),
//   createStruct(core.class.InstanceOf, core.class.Type, {
//     of: ref(core.class.Struct)
//   }, core.native.InstanceOf),

//   createClass(core.class.StructuralFeature, core.class.Doc, {
//     _attributes: bag(obj(core.class.Type)),
//     _extends: ref(core.class.Struct),
//     _native: resource()
//   }, core.native.StructuralFeature),

//   createClass(core.class.Struct, core.class.StructuralFeature, {
//   }, core.native.Struct),

//   createClass(core.class.Class, core.class.StructuralFeature, {
//   }, core.native.Class)
// ]
