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

import { Resource } from './platform'
import { CombineObjects, KeysByType } from 'simplytyped'

type MethodType = (...args: any[]) => any

export type Property<L, F> = { __layout: L, __feature: F }
export type Ref<T extends Doc> = string & { __ref: T } & Resource<T>
export type Method<T extends MethodType> = T & { __method: T } & Resource<T>

export interface Obj {
  _class: Ref<Class<Obj>>
}

export interface Emb extends Obj {
  __embedded: true
}

export interface Doc extends Obj {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
  _mixins?: Ref<Class<Doc>>[]
}

export type LayoutType = string | number
  | Emb
  | { [key: string]: LayoutType }
  | LayoutType[]
  | undefined

export type PropertyType = Property<LayoutType, any>
  | Resource<any>
  | Emb
  | PropertyType[]
  | { [key: string]: PropertyType }

export type StringProperty = Property<string, string>

export interface Attribute extends Emb {
}

export type Attributes<T extends E, E extends Obj> = Record<Exclude<keyof T, keyof E>, Attribute>
export type AllAttributes<T extends E, E extends Obj> = Required<Attributes<T, E>> & Partial<Attributes<E, Obj>>

export interface EClassifier<T extends E, E extends Obj> extends Doc {
  _attributes: AllAttributes<T, E>
  _extends?: Ref<Classifier<E>>
}

export type Classifier<T extends Obj> = EClassifier<T, Obj>

export interface EClass<T extends E, E extends Obj> extends EClassifier<T, E> {
  _native?: Resource<Object>
  _domain?: StringProperty
}

export type Class<T extends Obj> = EClass<T, Obj>

// T R A N S A C T I O N S

export type DateProperty = Property<number, Date>

export interface VDoc extends Doc {
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

export interface Tx extends Doc {
  _date: DateProperty
  _user: StringProperty
  _objectId: Ref<VDoc>
}

export interface CreateTx extends Tx {
  _objectClass: Ref<Class<VDoc>>
  _attributes: { [key: string]: PropertyType }
}

// L A Y O U T

type ToLayout<T> =
  T extends Resource<any> | undefined ? T :
    T extends Property<infer X, any> | undefined ? X :
      T extends { __embedded: true } ? T :
        LayoutA<T>

type LayoutA<T> = {
  [P in keyof T]:
  T[P] extends Resource<any> | undefined ? T[P] :
    T[P] extends Property<infer X, any> | undefined ? X :
      T[P] extends { __embedded: true } ? T[P] :
        T[P] extends (infer X)[] | undefined ? ToLayout<X>[] :
          T[P] extends { [key: string]: infer X } | undefined ? { [key: string]: ToLayout<X> } :
            never
}

export type Layout<T extends object> = LayoutA<CombineObjects<Omit<T, KeysByType<T, MethodType>>,
  Partial<Pick<T, KeysByType<T, MethodType>>>>>

export interface AnyLayout {
  [key: string]: LayoutType
}

export enum CoreDomain {
  Model = 'model'
}

export interface CoreProtocol {
  find(_class: Ref<Class<Doc>>, query: AnyLayout): Promise<Layout<Doc>[]>

  tx(tx: Tx): Promise<void>

  loadDomain(domain: string): Promise<Layout<Doc>[]>
}
