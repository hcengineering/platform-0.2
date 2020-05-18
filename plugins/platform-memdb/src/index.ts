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

interface Obj {
  _class: Ref<Class<this>>
}

interface Doc extends Obj {
  _id: Ref<this>
}

interface Type<T> extends Obj {

}

interface Class<T extends Obj> extends Doc {
  _attributes: { [key: string]: Type<any> }
}

type Instantiate<O> = {
  [P in keyof O]: O[P] extends Property<infer T> ? T : never
}

function newInstance<I extends object, X extends { [key: string]: PropertyType }> (intf: Ref<I>, object: X): Instantiate<X> {
  return {} as Instantiate<X>
}

interface Person {
  firstName: string
  lastName: string
  age: number
}

const refPerson = '' as Ref<Person>

const z = newInstance(refPerson, { a: '' as Str })
