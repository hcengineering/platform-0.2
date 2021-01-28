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

import 'reflect-metadata'

import core, {
  mixinKey
} from '.'
import {
  Ref, Class, Obj, Mixin, ClassifierKind, Classifier, Attribute, Type, Property, ArrayOf, Emb, InstanceOf, RefTo, Doc, BagOf
} from '@anticrm/core'

const classifierMetadataKey = Symbol("anticrm:classifier")

export function getClassifier (target: any): Classifier<Obj> {
  let classifier = Reflect.getOwnMetadata(classifierMetadataKey, target) as Classifier<Obj>
  if (!classifier) {
    classifier = {
      _attributes: {}
    } as Classifier<Obj>
    Reflect.defineMetadata(classifierMetadataKey, classifier, target)
  }
  return classifier
}

export function getAttribute (target: any, propertyKey: string): Attribute {
  const classifier = getClassifier(target)
  let attribute = (classifier._attributes as any)[propertyKey] as Attribute
  if (!attribute) {
    attribute = {
      _class: core.class.Attribute
    } as unknown as Attribute
    (classifier._attributes as any)[propertyKey] = attribute
  }
  return attribute
}

export function Class$<E extends Obj, T extends E> (id: Ref<Class<T>>, _extends: Ref<Class<E>>, domain?: string) {
  return function classDecorator<C extends { new(): T }> (constructor: C): void {
    const classifier = getClassifier(constructor.prototype)
    classifier._id = id
    classifier._class = core.class.Class
    classifier._kind = ClassifierKind.CLASS
    if (id !== _extends) {
      classifier._extends = _extends
    }
    if (domain) {
      (classifier as Class<T>)._domain = domain as Property<string, string>
    }
  }
}

export function Mixin$<E extends Obj, T extends E> (id: Ref<Mixin<T>>, _extends: Ref<Classifier<E>>) {
  return function classDecorator<C extends { new(): T }> (constructor: C): void {
    const classifier = getClassifier(constructor.prototype)
    classifier._id = id
    classifier._class = core.class.Mixin
    classifier._kind = ClassifierKind.MIXIN
    classifier._extends = _extends
  }
}

/**
 * Construct a property
 */
export function Prop (type: Ref<Class<Type>> = core.class.Type) {
  return function (target: any, propertyKey: string): void {
    // var t = Reflect.getMetadata('design:type', target, propertyKey)
    // console.log('design type:', propertyKey, t)

    const attribute = getAttribute(target, propertyKey)
    attribute.type = { _class: type } as unknown as Type
  }
}

export function RefTo$ (to: Ref<Class<Doc>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = { _class: core.class.RefTo, to: to } as unknown as RefTo<Doc>
    attribute.type = type
  }
}
export function BagOf$ () {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const type = attribute.type || { _class: core.class.Type } as unknown as Type
    const arr = { _class: core.class.BagOf, of: type } as unknown as BagOf
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
    const type = attribute.type || { _class: core.class.Type } as unknown as Type
    const arr = { _class: core.class.ArrayOf, of: type } as unknown as ArrayOf
    attribute.type = arr
  }
}

export function InstanceOf$<T extends Emb> (of: Ref<Class<T>>) {
  return function (target: any, propertyKey: string): void {
    const attribute = getAttribute(target, propertyKey)
    const arr = { _class: core.class.InstanceOf, of } as unknown as InstanceOf<T>
    attribute.type = arr
  }
}

export function Primary () {
  return function (target: any, propertyKey: string): void {
    const classifier = getClassifier(target)
    if (!classifier._mixins) {
      classifier._mixins = [core.mixin.Indices]
    } else {
      if (classifier._mixins.indexOf(core.mixin.Indices) == -1) {
        classifier._mixins.push(core.mixin.Indices)
      }
    }
    const doc = classifier as any
    doc[mixinKey(core.mixin.Indices, 'primary')] = propertyKey
  }
}
