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
import core, {
  AnyLayout, Attribute, Class, Classifier, ClassifierKind, CollectionOf, Doc, Emb, Enum, EnumLiteral,
  EnumOf, InstanceOf, Mixin, Model, Obj, Ref, RefTo, Type
} from '@anticrm/core'
import 'reflect-metadata'

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
      _attributes: { items: [] }, // Internal persistence is array
      _class: core.class.Class,
      _kind: ClassifierKind.CLASS
    }
  })
}

export function isKindOf (target: any, kind: ClassifierKind): boolean {
  const classifier = Reflect.getOwnMetadata(classifierMetadataKey, target) as ClassifierDefinition<Classifier>
  return classifier !== undefined && classifier.doc._kind === kind
}

export function getEnum (target: any): ClassifierDefinition<Enum> {
  return getClassifier<Enum>(target, () => {
    return {
      _literals: { items: [] },
      _class: core.class.Enum,
      _kind: ClassifierKind.ENUM
    }
  })
}

export function getAttribute (target: any, propertyKey: string): Attribute {
  const cl = getClass(target)
  const classifier = cl.doc
  let attribute = classifier._attributes?.items?.find(p => p._id === propertyKey)
  if (attribute === undefined) {
    attribute = {
      _id: propertyKey,
      name: propertyKey,
      _class: core.class.Attribute
    } as unknown as Attribute
    classifier._attributes.items?.push(attribute)
    cl.postProcessing.push((model, cl) => {
      if (attribute !== undefined) {
        attribute._id = ((cl._id as string) + '.' + propertyKey) as Ref<Doc>
      }
    })
  }
  return attribute
}

export function getEnumLiteral (target: any, propertyKey: string): EnumLiteral {
  const en = getEnum(target)
  const enumValue = en.doc
  let literal = enumValue._literals?.items?.find(p => p._id === propertyKey)
  if (literal === undefined) {
    literal = {
      _id: propertyKey,
      label: propertyKey,
      _class: core.class.EnumLiteral
    } as unknown as EnumLiteral
    enumValue._literals.items?.push(literal)
    en.postProcessing.push((model, cl) => {
      if (literal !== undefined) {
        literal._id = ((cl._id as string) + '.' + propertyKey) as Ref<Doc>
      }
    })
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

export function findParentClassifier (_class: Class<Obj>, parent: Ref<Class<Obj>>): Class<Obj> | undefined {
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
      // if (domain === MODEL_DOMAIN) {
      //   const vdoc = findParentClassifier(classifier, domains.class.VDoc)
      //   if (vdoc !== undefined) {
      //     throw new Error(`Classifier ${id} is extends ${domains.class.VDoc} and define ${domain} as domain` +
      //     '\nVDoc documents should be defined for own domains, not model domain.')
      //   }
      // }

      (classifier as Class<T>)._domain = domain
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

export function Enum$<T extends Enum> (id: Ref<Enum>) {
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
      _id: propertyKey as Ref<Obj>,
      _class: core.class.RefTo,
      to: to
    } as unknown as RefTo<Doc>
    attribute.type = type
  }
}

export function EnumOf$ (of: Ref<Enum>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = {
      _id: propertyKey as Ref<Obj>,
      _class: core.class.EnumOf,
      of
    } as unknown as EnumOf
    attribute.type = type
  }
}

export function InstanceOf$<T extends Emb> (of: Ref<Class<T>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = {
      _id: propertyKey as Ref<Obj>,
      _class: core.class.InstanceOf,
      of
    } as unknown as InstanceOf<Emb>
    attribute.type = type
  }
}

/**
 * Mark attribute as collection, if attribute already had type,
 * it will be wrapped inside.
 */
export function CollectionOf$<T extends Emb> (of: Ref<Class<T>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const arr: CollectionOf<T> = {
      _id: propertyKey as Ref<Obj>,
      _class: core.class.CollectionOf,
      of
    }
    attribute.type = arr
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
