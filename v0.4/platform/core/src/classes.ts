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

export type PrimitiveType = number | string | boolean | undefined

export type Ref<T extends Doc> = string & { __ref: T }

export interface Obj {
  _id: Ref<Obj>
  _class: Ref<Class<Obj>>
  _mixins?: Array<Ref<Mixin<Obj>>>
}

export interface Emb extends Obj {
  _id: Ref<Emb>
  _class: Ref<Class<Emb>>
}

export interface Doc extends Obj {
  _id: Ref<Doc>
  _class: Ref<Class<Doc>>
}

// Collections

/**
 * Interface to define a collection of embedded objects associated with object.
 */
export interface Collection<T> {
  items?: T[]
}

export type PropertyType = PrimitiveType | Ref<Doc> | Emb

// An attribute type.
export interface Type extends Emb {
  _default?: PropertyType
}

export interface Attribute extends Emb {
  name: string
  type: Type
}

export enum ClassifierKind {
  CLASS,
  MIXIN,
  ENUM
}

export interface Classifier extends Doc {
  _kind: ClassifierKind
}

export type Mixin<T extends Obj> = EClass<T>

export interface EDomainClassifier {
  _domain?: string
}

export interface EClass<E extends Obj> extends Classifier, EDomainClassifier {
  _attributes: Collection<Attribute>
  _extends?: Ref<Class<E>>

  _native?: string
}

export type Class<T extends Obj> = EClass<T>

export interface EnumLiteral extends Emb {
  label: string
  ordinal: string | number
}

export interface Enum extends Classifier {
  _literals: Collection<EnumLiteral>
}

// T Y P E S

export interface RefTo<T extends Doc> extends Type {
  to: Ref<Class<T>>
}

export interface InstanceOf<T extends Emb> extends Type {
  of: Ref<Class<T>>
}

export interface EnumOf extends Type {
  of: Ref<Enum>
}

export interface CollectionOf<T extends Emb> extends Type {
  of: Ref<Class<T>>
}

///

type AnyPropertyType = PrimitiveType | Ref<Doc> | Emb | { [key: string]: AnyPropertyType }
export interface AnyLayout {
  [key: string]: AnyPropertyType
}
