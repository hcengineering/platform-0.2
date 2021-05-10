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

import { AnyLayout, Class, Doc, Obj, Ref } from '@anticrm/core'
import domain from '..'
import { ObjectSelector, TxOperation, TxOperationKind } from '.'

interface TxOperationBuilder<T> {
  match: (values: Partial<T>) => T & TxBuilder<T>
  set: (value: Partial<T>) => TxOperation
  build: () => ObjectSelector[]
  push: (value: Partial<T>) => TxOperation
  pull: () => TxOperation
}

export type TxBuilderArrayOf<A> = A extends Array<infer T> ? TxBuilderOrOpBuilderOf<T> : never

export type TxBuilderOrOpBuilderOf<A> = A extends Obj ? TxBuilder<A>: TxOperationBuilder<A>
export type TxBuilderOf<A> = A extends Obj ? TxBuilder<A>: never

export type FieldBuilder<T> = {
  [P in keyof T]-?: TxBuilderArrayOf<T[P]> | TxBuilderOf<T[P]>;
}
export type TxBuilder<T> = TxOperationBuilder<T> & FieldBuilder<T>

class TxBuilderImpl<T> {
  result: ObjectSelector[] = []
  current: ObjectSelector = { _class: domain.class.ObjectSelector, key: '' }
  factory: () => TxBuilder<any>

  constructor (selector: ObjectSelector[], factory: () => TxBuilder<T>) {
    this.result = [...selector]
    this.factory = factory
  }

  match<Q extends Doc> (values: Partial<Q>): Q & TxBuilder<Q> {
    this.current.pattern = (values as unknown) as AnyLayout
    this.result.push(this.current)
    this.current = { _class: domain.class.ObjectSelector, key: '' }
    return (this.factory() as unknown) as Q & TxBuilder<Q>
  }

  build (): ObjectSelector[] | undefined {
    if (this.current.key !== '') {
      this.result.push(this.current)
      this.current = { _class: domain.class.ObjectSelector, key: '' }
    }
    if (this.result.length > 0) {
      return this.result
    }
  }

  set (value: Partial<T>): TxOperation {
    return {
      _class: domain.class.TxOperation,
      kind: TxOperationKind.Set,
      selector: this.build(),
      _attributes: (value as unknown) as AnyLayout
    }
  }

  push<Q extends Doc> (value: Partial<Q>): TxOperation {
    return {
      _class: domain.class.TxOperation,
      kind: TxOperationKind.Push,
      selector: this.build(),
      _attributes: (value as unknown) as AnyLayout
    }
  }

  pull (): TxOperation {
    return {
      _class: domain.class.TxOperation,
      kind: TxOperationKind.Pull,
      selector: this.build()
    }
  }

  updateKey (property: string): void {
    if (this.current.key !== '') {
      this.result.push(this.current)
    }
    this.current = { _class: domain.class.ObjectSelector, key: '' }
    this.current.key = property
  }
}

/**
 * Construct TxOperation builder to create TxOperation to perform object update.
 * @param clazz - an object class to build operation for.
 */
export function txBuilder<T extends Doc> (clazz: Ref<Class<T>>): TxBuilder<T> {
  const ph: ProxyHandler<TxBuilderImpl<T>> = {
    get (target, property, receiver) { // Trap for getting property values
      switch (property) {
        case 'match':
          return target.match.bind(target)
        case 'build':
          return target.build.bind(target)
        case 'set':
          return target.set.bind(target)
        case 'push':
          return target.push.bind(target)
        case 'pull':
          return target.pull.bind(target)
      }
      const nb = new TxBuilderImpl<T>(target.result, () => np)
      const np = new Proxy(nb, ph) as unknown as TxBuilder<T>
      nb.updateKey(property as string)

      return np
    }
  }
  const nb = new TxBuilderImpl<T>([], () => np)
  const np = new Proxy(nb, ph) as unknown as TxBuilder<T>
  return np
}
