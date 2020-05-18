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

/** This is the only allowed type for an object property */
type Property<T> = { __property: T }

/** Object property serialized as String */
type StringProperty<T> = string & Property<T>
/** Object property serialized as Number */
type NumberProperty<T> = number & Property<T>

type PropertyType = Property<any> | undefined

type Str = StringProperty<string>

type Resource<T> = { __resource: T }

type Ref<T> = StringProperty<T> & { __ref: true }

type Bag<T extends PropertyType> = { [key: string]: T }

interface Obj {
  _class: Ref<Class<this>>
}

interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}

interface Type<T> extends Obj {

}

/////

type AsDescrtiptors<T> = { [P in keyof T]:
  T[P] extends Property<infer X> ? Type<X> :
  T[P] extends { [key: string]: PropertyType } ? Type<Bag<PropertyType>> :
  never
}
type Descriptors<T extends object> = AsDescrtiptors<T>
export type Attributes<T extends E, E extends Obj> = Descriptors<Omit<T, keyof E>>

interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: Attributes<T, E>
}

type Class<T extends Obj> = EClass<T, Obj>

////////////

// type Instantiate<O> = {
//   [P in keyof O]: O[P] extends Property<infer T> ? T : never
// }

// function newInstance<I extends object, X extends { [key: string]: PropertyType }> (intf: Ref<I>, object: X): Instantiate<X> {
//   return {} as Instantiate<X>
// }

/////

interface Session {
  // newInstance       <M extends T, T extends Doc>         (clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 

  newInstance<M extends Obj> (clazz: Ref<Class<M>>, values: Omit<M, keyof Obj>): M
  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M
}

interface Person extends Doc {
  firstName: Str
  lastName: Str
}

const x = {} as EClass<Person, Doc>

x._attributes.firstName

const y = {} as Class<Class<Obj>>

const refPerson = '' as Ref<Class<Person>>
const refClassClass = '' as Ref<Class<EClass<Person, Doc>>>
const refTypeString = '' as Ref<Class<Type<string>>>

const S = {} as Session

const z = S.newInstance(refPerson, { firstName: 'John' as Str, lastName: 'Carmack' as Str, _id: '' as Ref<Person> })
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
