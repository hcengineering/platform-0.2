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

import { AnyLayout, Class, DateProperty, Doc, Emb, Mixin, Obj, Property, Ref, StringProperty, Tx } from '@anticrm/core'

// TXes

export const CORE_CLASS_TX = 'class:core.Tx' as Ref<Class<Tx>>
export const CORE_CLASS_OBJECT_TX = 'class:core.ObjectTx' as Ref<Class<ObjectTx>>
export const CORE_CLASS_OBJECT_SELECTOR = 'class:core.ObjectSelector' as Ref<Class<ObjectSelector>>
export const CORE_CLASS_OBJECTTX_DETAILS = 'class:core.ObjectTxDetails' as Ref<Class<ObjectTxDetails>>
export const CORE_CLASS_CREATE_TX = 'class:core.CreateTx' as Ref<Class<CreateTx>>
export const CORE_CLASS_UPDATE_TX = 'class:core.UpdateTx' as Ref<Class<UpdateTx>>
export const CORE_CLASS_TX_OPERATION = 'class:core.TxOperation' as Ref<Class<TxOperation>>
export const CORE_CLASS_DELETE_TX = 'class:core.DeleteTx' as Ref<Class<DeleteTx>>

export const TX_DOMAIN = 'tx'

export interface ObjectTxDetails extends Emb {
  name?: string
  id?: string
  description?: string
}

export interface ObjectTx extends Tx {
  _objectId: Ref<Doc>
  _objectClass: Ref<Class<Doc>>
  _objectSpace?: Ref<Space> // For some system wide operations, space may be missing

  _txDetails?: ObjectTxDetails
}

/**
 * Perform an object creation.
 * In case _class is mixin, object of first parent Class will be stored into storage.
 */
export interface CreateTx extends ObjectTx {
  object: AnyLayout
}

/**
 * An update transaction, operation kind.
 */
export enum TxOperationKind {
  Set,
  Push,
  Pull
}

export interface ObjectSelector extends Emb {
  key: string // A field key
  pattern?: AnyLayout | Property<any, any> // A pattern to match inside array, may be missing for some operations.
}

/**
 * Update operation inside update transaction, could contain changes to some of individual embedded attributes.
 * And operations with arrays.
 */
export interface TxOperation extends Emb {
  kind: TxOperationKind
  /*
   Embedded object/Array selector, will determine type of object passed as individual operations.

   Selector is array of (Key, QueryObject) pairs, with last one could be omitted.
   Key - is array or embedded object name field.
   ObjectQuery - is object matching to ensure element in array.

   Using selector it is possible to identify attribute/embedded object to perform update, push, pull operations on.
   parentKey: {parentSelector}, arrayKey

   If selector is not specified, only update operation is allowed and will be performed against object itself.
   */
  selector?: ObjectSelector[]

  // will determine an object or individual value to be updated.
  _attributes?: Property<any, any> | AnyLayout
}

/**
 * Perform an object update operation.
 * In case _class is mixin, object of first parent Class will be stored into storage.
 */
export interface UpdateTx extends ObjectTx {
  operations: TxOperation[]
}

/**
 * Delete removed object fully from storage.
 */
export interface DeleteTx extends ObjectTx {
}

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
  current: ObjectSelector = { _class: CORE_CLASS_OBJECT_SELECTOR, key: '' }
  factory: () => TxBuilder<any>

  constructor (selector: ObjectSelector[], factory: () => TxBuilder<T>) {
    this.result = [...selector]
    this.factory = factory
  }

  match<Q extends Doc> (values: Partial<Q>): Q & TxBuilder<Q> {
    this.current.pattern = (values as unknown) as AnyLayout
    this.result.push(this.current)
    this.current = { _class: CORE_CLASS_OBJECT_SELECTOR, key: '' }
    return (this.factory() as unknown) as Q & TxBuilder<Q>
  }

  build (): ObjectSelector[] | undefined {
    if (this.current.key !== '') {
      this.result.push(this.current)
      this.current = { _class: CORE_CLASS_OBJECT_SELECTOR, key: '' }
    }
    if (this.result.length > 0) {
      return this.result
    }
  }

  set (value: Partial<T>): TxOperation {
    return {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Set,
      selector: this.build(),
      _attributes: (value as unknown) as AnyLayout
    }
  }

  push<Q extends Doc> (value: Partial<Q>): TxOperation {
    return {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Push,
      selector: this.build(),
      _attributes: (value as unknown) as AnyLayout
    }
  }

  pull (): TxOperation {
    return {
      _class: CORE_CLASS_TX_OPERATION,
      kind: TxOperationKind.Pull,
      selector: this.build()
    }
  }

  updateKey (property: string): void {
    if (this.current.key !== '') {
      this.result.push(this.current)
    }
    this.current = { _class: CORE_CLASS_OBJECT_SELECTOR, key: '' }
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

// S P A C E

/**
 * Define a space user - association, it hold some extra properties.
 */
export interface SpaceUser extends Emb {
  userId: string // An user account id
  owner: boolean // Make user as space owner
}

export const CORE_CLASS_SPACE = 'class:core.Space' as Ref<Class<Space>>
export const CORE_CLASS_SPACE_USER = 'class:core.SpaceUser' as Ref<Class<SpaceUser>>

/**
 * Define an application descriptor.
 */
export interface Application extends Doc {
}

export interface Space extends Doc {
  name: string // a space name
  description: string // a space optional description.

  application: Ref<Application> // An application space is belong to.
  applicationSettings?: Emb // Some custom application settings.

  spaceKey: string // A space shortId prefix.

  users: SpaceUser[] // A list of included user accounts, not all may be active.
  isPublic: boolean // If specified, a users are interpreted as include list.
  archived: boolean // If specified, channel is marked as archived, only owner could archive space
}

// V D O C

export interface List extends Emb {
  id: string
  name: string
  application: Ref<Application>
}

export const CORE_CLASS_VDOC = 'class:core.VDoc' as Ref<Class<VDoc>>

export interface VDoc extends Doc {
  _space: Ref<Space>
  _createdOn: DateProperty
  _createdBy: StringProperty
  _modifiedOn?: DateProperty
  _modifiedBy?: StringProperty
}

// R E F E R E N C E S

export const CORE_CLASS_REFERENCE = 'class:core.Reference' as Ref<Class<Reference>>
export const CORE_MIXIN_SHORTID = 'mixin:core.ShortID' as Ref<Mixin<ShortID>>

/**
 * A reference object from and source to any target
 *
 * source - define a source object with class and properties.
 * target - define a target object with class and properties.
 */
export interface Reference extends Doc {
  _sourceId?: Ref<Doc>
  _sourceClass: Ref<Class<Doc>>
  _sourceProps?: Record<string, unknown>

  _targetId?: Ref<Doc>
  _targetClass: Ref<Class<Doc>>
  _targetProps?: Record<string, unknown>
}

/**
 * Define a list of space references for this object, this is a mixin.
 */
export interface ShortID extends VDoc {
  /**
   * A useful short Id for this object.
   */
  shortId: string
}

export const REFERENCE_DOMAIN = 'references'

// T I T L E

export const TITLE_DOMAIN = 'title'
export const CORE_CLASS_TITLE = 'class:core.Title' as Ref<Class<Title>>

/**
 * Define a title source, ShortId titles will be used to reference documents with short form.
 */
export enum TitleSource {
  Title, ShortId
}

export interface Title extends Doc {
  _objectClass: Ref<Class<Doc>>
  _objectId: Ref<Doc>
  title: string | number
  source: TitleSource
}
