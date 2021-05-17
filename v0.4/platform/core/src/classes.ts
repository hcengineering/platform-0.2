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
  _class: Ref<Class<Obj>>
  _mixins?: Array<Ref<Mixin<Obj>>>
}

export interface Emb extends Obj {
  _class: Ref<Class<Emb>>
}

export interface Doc extends Obj {
  _class: Ref<Class<Doc>>
  _id: Ref<Doc>
}

export type PropertyType = PrimitiveType| Ref<Doc> | Emb | PropertyType[] | { [key: string]: PropertyType }

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
  MIXIN,
  ENUM
}

export interface Classifier extends Doc {
  _kind: ClassifierKind
}

export interface EMixin<T extends E, E extends Obj> extends EClass<T, E> {
}

export type Mixin<T extends Obj> = EMixin<T, Obj>

export interface EDomainClassifier {
  _domain?: string
}

export interface EClass<T extends E, E extends Obj> extends Classifier, EDomainClassifier {
  _attributes: AllAttributes<T, E>
  _extends?: Ref<Class<E>>

  _native?: string
}

export type Class<T extends Obj> = EClass<T, Obj>

export interface EnumLiteral extends Emb {
  label: string
  ordinal: string | number
}

export type EnumKey = string | number | symbol
export type EnumLiterals<T extends EnumKey, E extends EnumLiteral> = { [Q in T]: E }

export interface EEnum<T extends EnumKey, E extends EnumLiteral> extends Classifier {
  _literals: EnumLiterals<T, E>
}

export type Enum<T extends EnumKey> = EEnum<T, EnumLiteral>

// T Y P E S

export interface RefTo<T extends Doc> extends Type {
  to: Ref<Class<T>>
}

export interface EnumOf<T extends EnumKey> extends Type {
  of: Ref<Enum<T>>
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

export interface AnyLayout {
  [key: string]: PropertyType
}
