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

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'reflect-metadata'

import core from '.'
import {
  AnyLayout, ArrayOf, Attribute, BagOf, Class, Classifier, ClassifierKind, Doc, Emb, Enum, EnumKey, EnumLiteral,
  EnumLiterals, EnumOf, InstanceOf, Mixin, Model, MODEL_DOMAIN, Obj, Property, Ref, RefTo, StringProperty, Type
} from '@anticrm/core'
import { CORE_CLASS_VDOC } from '@anticrm/domains'

const classIdentities = new Map<Ref<Class<Obj>>, Class<Obj>>()

const classifierMetadataKey = Symbol('anticrm:classifier')

export type ClassifierPostProcessing<T extends Doc> = (model: Model, classifier: T) => void

export interface ClassifierDefinition<T extends Doc> {
  doc: T
  postProcessing: Array<ClassifierPostProcessing<T>>
}

export function loadClassifier<T extends Doc> (target: any): ClassifierDefinition<T> {
  return Reflect.getOwnMetadata(classifierMetadataKey, target) as ClassifierDefinition<T>
}

function getClassifier<T extends Doc> (target: any, factory: () => Partial<T>): ClassifierDefinition<T> {
  let classifier = loadClassifier<T>(target)
  if (classifier === undefined) {
    classifier = {
      doc: factory() as T,
      postProcessing: []
    }
    Reflect.defineMetadata(classifierMetadataKey, classifier, target)
  }
  return classifier
}

export function getClass (target: any): ClassifierDefinition<Class<Obj>> {
  return getClassifier<Class<Obj>>(target, () => {
    return {
      _attributes: {},
      _class: core.class.Class,
      _kind: ClassifierKind.CLASS
    }
  })
}

export function isKindOf (target: any, kind: ClassifierKind): boolean {
  const classifier = Reflect.getOwnMetadata(classifierMetadataKey, target) as ClassifierDefinition<Classifier>
  return classifier !== undefined && classifier.doc._kind === kind
}

export function getEnum (target: any): ClassifierDefinition<Enum<any>> {
  return getClassifier<Enum<any>>(target, () => {
    return {
      _literals: {},
      _class: core.class.Enum,
      _kind: ClassifierKind.ENUM
    }
  })
}

export function getAttribute (target: any, propertyKey: string): Attribute {
  const classifier = getClass(target).doc
  let attribute = (classifier._attributes as any)[propertyKey] as Attribute
  if (attribute === undefined) {
    attribute = {
      _class: core.class.Attribute
    } as unknown as Attribute
    (classifier._attributes as any)[propertyKey] = attribute
  }
  return attribute
}

export function getEnumLiteral (target: any, propertyKey: string): EnumLiteral {
  const enumValue = getEnum(target).doc
  let literal = (enumValue._literals as any)[propertyKey] as EnumLiteral
  if (literal === undefined) {
    literal = {
      _class: core.class.EnumLiteral
    } as unknown as EnumLiteral
    (enumValue._literals as any)[propertyKey] = literal
  }
  return literal
}

export function loadClassifierChild (target: any, propertyKey: string): Emb | undefined {
  if (isKindOf(target, ClassifierKind.CLASS)) {
    return getAttribute(target, propertyKey)
  } else if (isKindOf(target, ClassifierKind.ENUM)) {
    return getEnumLiteral(target, propertyKey)
  }
  return undefined
}

function findParentClassifier (_class: Class<Obj>, parent: Ref<Class<Obj>>): Class<Obj> | undefined {
  let cl = classIdentities.get(_class._extends as Ref<Class<Obj>>)
  while (cl !== undefined) {
    if (cl._id === parent) {
      return cl
    }
    if (cl._extends !== undefined) {
      cl = classIdentities.get(cl._extends)
    } else {
      break
    }
  }
}

export function Class$<E extends Obj, T extends E> (id: Ref<Class<T>>, _extends: Ref<Class<E>>, domain?: string) {
  return function classDecorator<C extends new () => T> (constructor: C): void {
    const classifier = getClass(constructor.prototype).doc
    classifier._id = id
    classifier._class = core.class.Class
    classifier._kind = ClassifierKind.CLASS

    // Store to be a able to perform some checks.
    classIdentities.set(classifier._id as Ref<Class<Doc>>, classifier)

    if (id !== _extends) {
      classifier._extends = _extends
    }
    if (domain !== undefined) {
      // Do not allow VDoc's to be in Model domain.
      if (domain === MODEL_DOMAIN) {
        const vdoc = findParentClassifier(classifier, CORE_CLASS_VDOC)
        if (vdoc !== undefined) {
          throw new Error(`Classifier ${id} is extends ${CORE_CLASS_VDOC} and define ${domain} as domain` +
          '\nVDoc documents should be defined for own domains, not model domain.')
        }
      }

      (classifier as Class<T>)._domain = domain as Property<string, string>
    }
  }
}

export function Mixin$<E extends Obj, T extends E> (id: Ref<Mixin<T>>, _extends: Ref<Class<E>>) {
  return function classDecorator<C extends new () => T> (constructor: C): void {
    const classifier = getClass(constructor.prototype).doc
    classifier._id = id
    classifier._class = core.class.Mixin
    classifier._kind = ClassifierKind.MIXIN
    classifier._extends = _extends
  }
}

export function Enum$<T extends EnumLiterals<E, EnumLiteral>, E extends EnumKey> (id: Ref<Enum<E>>) {
  return function classDecorator<C extends new () => T> (constructor: C): void {
    const classifier = getEnum(constructor.prototype).doc
    classifier._id = id
  }
}

/**
 * Construct a property
 */
export function Prop (type: Ref<Class<Type>> = core.class.Type) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    attribute.type = { _class: type } as unknown as Type
  }
}

export function RefTo$ (to: Ref<Class<Doc>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = {
      _class: core.class.RefTo,
      to: to
    } as unknown as RefTo<Doc>
    attribute.type = type
  }
}

export function EnumOf$ (of: Ref<Enum<any>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = {
      _class: core.class.EnumOf,
      of
    } as unknown as EnumOf<EnumKey>
    attribute.type = type
  }
}

export function BagOf$ () {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = attribute.type ?? { _class: core.class.Type } as unknown as Type
    const arr = {
      _class: core.class.BagOf,
      of: type
    } as unknown as BagOf
    attribute.type = arr
  }
}

/**
 * Mark attribute as collection, if attribute already had type,
 * it will be wrapped inside.
 */
export function ArrayOf$ () {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = attribute.type ?? { _class: core.class.Type } as unknown as Type
    const arr = {
      _class: core.class.ArrayOf,
      of: type
    } as unknown as ArrayOf
    attribute.type = arr
  }
}

export function InstanceOf$<T extends Emb> (of: Ref<Class<T>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const arr = {
      _class: core.class.InstanceOf,
      of
    } as unknown as InstanceOf<T>
    attribute.type = arr
  }
}

export function Primary () {
  return function (target: any, propertyKey: string): void {
    const classifier = getClass(target)

    classifier.postProcessing.push((model, cl) => {
      model.mixinDocument(cl, core.mixin.Indices, { primary: propertyKey as StringProperty })
    })
  }
}

/**
 * Construct a enum literal
 */
export function Literal (enumVal: any) {
  return function (target: any, propertyKey: string): void {
    const attribute = getEnumLiteral(target, propertyKey)
    attribute._class = core.class.EnumLiteral
    attribute.label = enumVal[propertyKey]
    attribute.ordinal = enumVal[attribute.label]
    if (attribute.ordinal === undefined && attribute.label === undefined) {
      // This is string labeled enum
      for (const e of Object.entries(enumVal)) {
        if (e[1] === propertyKey) {
          attribute.label = e[0]
          break
        }
      }
      attribute.ordinal = propertyKey
    }
  }
}

export function withMixin<T extends Obj> (_class: Ref<Mixin<T>>, obj: Partial<Omit<T, keyof Obj>>) {
  return function (target: any, propertyKey: string): void {
    const doc = loadClassifierChild(target, propertyKey)
    if (doc !== undefined) {
      const classifier = loadClassifier<Doc>(target)
      classifier.postProcessing.push((model, cl) => {
        Model.includeMixin(doc, _class)
        model.assign(model.getLayout(doc), _class, (obj as unknown) as AnyLayout)
      })
    }
  }
}
