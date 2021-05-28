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

import core, {
  Attribute, Class, ClassifierKind, CollectionId, Doc, DocumentValue, DocumentValueOmit, Emb, Enum, EnumLiteral, Mixin, Obj, Ref
} from '@anticrm/core'
import { CombineObjects, KeysByType } from 'simplytyped'
import { ModelBuilder } from './model_builder'
import { collectModel, Collector } from './ts_builder'

type MethodType = (...args: any[]) => any

export type OptionalMethods<T extends Record<string, unknown>> = CombineObjects<Omit<T, KeysByType<T, MethodType>>,
Partial<Pick<T, KeysByType<T, MethodType>>>>

export type ExtractClass<T extends Obj, X extends Record<string, Ref<Class<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Class<T>> ? Partial<Class<T>> : never
}

export type ExtractMixin<T extends Obj, X extends Record<string, Ref<Mixin<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Mixin<T>> ? Partial<Mixin<T>> : never
}

export type ExtractEnum<T, X extends Record<string, Ref<Enum<T>>>> = {
  [P in keyof X]: X[P] extends Ref<Enum<T>> ? Partial<Enum<T>> : never
}

export class Builder {
  private readonly collectedIds: { [key: string]: Ref<Doc>} = {} // Contains a map of source ids to plugin reference Ids.
  private readonly collectors: {[key: string]: Collector} = {}

  builder: ModelBuilder

  constructor (modelBuilder: ModelBuilder) {
    this.builder = modelBuilder
  }

  loadClass <T extends Obj, X extends Record<string, Ref<Class<T>>>>(_fileName: string, ids: X, classes: ExtractClass<T, X>, _domain?: string): void {
    this.buildClassifier<T, X>(ClassifierKind.CLASS, _fileName, ids, classes, _domain)
  }

  loadMixin <T extends Obj, X extends Record<string, Ref<Mixin<T>>>>(_fileName: string, ids: X, classes: ExtractMixin<T, X>): void {
    this.buildClassifier<T, X>(ClassifierKind.MIXIN, _fileName, ids, classes)
  }

  loadEnum <T, X extends Record<string, Ref<Enum<T>>>>(_fileName: string, ids: X, _classes: ExtractEnum<T, X>): void {
    const collector = this.collectors[_fileName] ?? collectModel(_fileName)
    this.collectors[_fileName] = collector

    for (const key in ids) {
      const id = ids[key]
      const sourceId = collector.sourceId(key)
      this.collectedIds[sourceId] = id as Ref<Enum<any>>
      const _objectId = id as unknown as Ref<Class<Obj>>
      const { _literals, _class, _id, ..._value } = collector.buildEnum(key, _objectId)
      this.builder.addDoc<Enum<any>>(_class, _value, _id as Ref<Enum<any>>)
      for (const literal of _literals.items ?? []) {
        this.builder.addEmb<Enum<any>, EnumLiteral>(_class, _id as Ref<Enum<any>>, (ci) => ci._literals, core.class.EnumLiteral, literal)
      }
    }
  }

  private buildClassifier <T extends Obj, X extends Record<string, Ref<Class<T>>>>(_kind: ClassifierKind, _fileName: string, ids: X, classes: ExtractClass<T, X>, _domain?: string): void {
    const collector = this.collectors[_fileName] ?? collectModel(_fileName)
    this.collectors[_fileName] = collector

    for (const key in ids) {
      const cc = classes[key]
      if (cc._extends === undefined) {
        const id = ids[key]
        const sourceId = collector.sourceId(key)
        this.collectedIds[sourceId] = id as Ref<Class<Obj>>
      }
    }

    for (const key in ids) {
      const id = ids[key]
      const cc = classes[key]
      if (cc._domain === undefined) {
        cc._domain = _domain
      }
      const _objectId = id as unknown as Ref<Class<Obj>>
      const { _id, _class, _attributes, ..._value } = collector.buildClass(_kind, key, _objectId, cc, this.collectedIds)
      this.builder.addDoc<Class<Obj>>(_class, _value, _id as Ref<Class<Obj>>)
      for (const attribute of _attributes.items ?? []) {
        this.builder.addEmb<Class<Obj>, Attribute>(_class, _id as Ref<Class<Obj>>, (ci) => ci._attributes, core.class.Attribute, attribute)
      }
    }
  }

  load (model: (builder: Builder) => void): void {
    model(this)
  }

  mixin<E extends Doc, T extends Obj> (_objectId: Ref<E>, _objectClass: Ref<Class<E>>, _mixinClass: Ref<Mixin<T>>, _value: DocumentValueOmit<T, E>): void {
    this.builder.mixin(_objectClass, _objectId, _mixinClass, _value)
  }

  mixinEmb<E extends Doc, T extends Obj, C extends Emb> (_objectId: Ref<E>, _objectClass: Ref<Class<E>>, _collectionId: CollectionId<E>, _id: Ref<C>, _mixinClass: Ref<Mixin<T>>, _value: DocumentValueOmit<T, C>): void {
    this.builder.mixinEmb(_objectClass, _objectId, _collectionId, _id, _mixinClass, _value)
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, _value: DocumentValue<M>, _id?: Ref<M>): void {
    this.builder.addDoc(_class, _value, _id)
  }
}
