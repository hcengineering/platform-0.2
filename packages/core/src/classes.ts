//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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

type PrimitiveType = number | string | boolean | undefined

export type Property<P extends PrimitiveType, T> = P & { __property: T }
export type Ref<T extends Doc> = string & { __ref: T }
// type MethodType = (...args: any[]) => any
// export type Method<T extends MethodType> = T & { __method: T }

export interface Obj {
  _class: Ref<Class<Obj>>
  _mixins?: Ref<Mixin<Obj>>[]
}

export interface Emb extends Obj {
  __embedded: true
}

export interface Doc extends Obj {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
}

export type PropertyType = Property<PrimitiveType, any>
  | { __ref: Doc }
  | Emb
  | PropertyType[]
  | { [key: string]: PropertyType }

export type StringProperty = Property<string, string>
export type BooleanProperty = Property<boolean, boolean>
export type DateProperty = Property<number, Date>
export type NumberProperty = Property<number, number>

// An attribute type with some defined mixins inside.
export interface Type extends Emb {
  _default?: PropertyType
}

export interface Attribute extends Emb {
  type: Type
}

export type Attributes<T extends E, E extends Obj> = Record<Exclude<keyof T, keyof E>, Attribute>
export type AllAttributes<T extends E, E extends Obj> = Required<Attributes<T, E>> & Partial<Attributes<E, Obj>>

export enum ClassifierKind {
  CLASS,
  MIXIN
}

export interface EClassifier<T extends E, E extends Obj> extends Doc {
  _kind: ClassifierKind
  _attributes: AllAttributes<T, E>
  _extends?: Ref<Classifier<E>>
}

export type Classifier<T extends Obj> = EClassifier<T, Obj>

export interface EMixin<T extends E, E extends Obj> extends EClass<T, E> {
}

export type Mixin<T extends Obj> = EMixin<T, Obj>

export interface EClass<T extends E, E extends Obj> extends EClassifier<T, E> {
  _native?: StringProperty
  _domain?: StringProperty
}

export type Class<T extends Obj> = EClass<T, Obj>

// T Y P E S

export interface RefTo<T extends Doc> extends Type {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Emb> extends Type {
  of: Ref<Class<T>>
}

export interface BagOf extends Type {
  of: Type
}

export interface ArrayOf extends Type {
  of: Type
}

///

export interface Indices extends Mixin<Doc> {
  primary: StringProperty
}

export interface AnyLayout {
  [key: string]: PropertyType
}

///

export const CORE_CLASS_OBJ = 'class:core.Obj' as Ref<Class<Obj>>
export const CORE_CLASS_DOC = 'class:core.Doc' as Ref<Class<Doc>>
export const CORE_CLASS_EMB = 'class:core.Emb' as Ref<Class<Emb>>
export const CORE_CLASS_CLASS = 'class:core.Class' as Ref<Class<Class<Obj>>>
export const CORE_CLASS_STRING = 'class:core.String' as Ref<Class<Type>>
export const CORE_CLASS_ATTRIBUTE = 'class:core.Attribute' as Ref<Class<Attribute>>
export const CORE_CLASS_TYPE = 'class:core.Type' as Ref<Class<Type>>

export const CORE_CLASS_ARRAY_OF = 'class:core.ArrayOf' as Ref<Class<ArrayOf>>
export const CORE_CLASS_INSTANCE_OF = 'class:core.InstanceOf' as Ref<Class<InstanceOf<Emb>>>

export const CORE_MIXIN_INDICES = 'mixin:core.Indices' as Ref<Mixin<Indices>>
