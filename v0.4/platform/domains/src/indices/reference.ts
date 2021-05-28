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

import core, { AnyLayout, Class, Doc, TransactionProtocol, Emb, Model, Obj, Ref, Storage, Tx, TxContext } from '@anticrm/core'
import {
  MessageMarkType, parseMessage, ReferenceMark, traverseMarks, traverseMessage
} from '@anticrm/text'
import { deepEqual } from 'fast-equals'
import domains from '..'
import { Reference } from '../references'
import { Space } from '../space'
import { AddItemTx, create, CreateTx, DeleteTx, remove, UpdateItemTx, UpdateTx, RemoveItemTx } from '../tx'
import { processTransactions } from '../tx_utils'

/**
 * I N D E X
 *
 * Parses object's and find backlinks in string values with reference format [Name](ref://class#id)
 *
 * Example:
 * Hello [Zaz](ref://chunter.Page#600eb7121900e6e361085f20)
 */
export class ReferenceIndex implements TransactionProtocol {
  private readonly modelDb: Model
  private readonly storage: Storage
  private readonly textAttributes = new Map<Ref<Class<Obj>>, string[]>()

  constructor (modelDb: Model, storage: Storage) {
    this.modelDb = modelDb
    this.storage = storage
  }

  private getTextAttributes (_class: Ref<Class<Obj>>): string[] {
    const cached = this.textAttributes.get(_class)
    if (cached !== undefined) return cached

    const keys = this.modelDb
      .getAllAttributes(_class)
      .filter((m) => m.attr.type._class === core.class.String)
      .map((m) => m.key)
    this.textAttributes.set(_class, keys)
    return keys
  }

  private referencesFromMessage (
    _class: Ref<Class<Doc>>,
    _id: Ref<Doc>,
    _itemClass: Ref<Class<Emb>>| undefined,
    _itemId: Ref<Emb> | undefined,
    _collection: string | undefined,
    field: string,
    message: string): Reference[] {
    const result: Reference[] = []
    const refMatcher = new Set()
    let index = 0
    traverseMessage(parseMessage(message), (el) => {
      traverseMarks(el, (m) => {
        if (m.type === MessageMarkType.reference) {
          const rm = m as ReferenceMark
          const key = rm.attrs.id + rm.attrs.class
          if (!refMatcher.has(key)) {
            refMatcher.add(key)
            index++
            const ref: Reference = {
              _class: domains.class.Reference,
              _id: `${_id}-${field}-${_itemId ?? ''}-${index}` as Ref<Doc>, // Generate a sequence id based on source object id.

              _targetId: rm.attrs.id as Ref<Doc>,
              _targetClass: rm.attrs.class as Ref<Class<Doc>>,

              _sourceId: _id,
              _sourceClass: _class,
              _sourceField: field,
              _sourceIndex: index,

              _itemClass,
              _itemId,
              _collection
            }
            result.push(ref)
          }
        }
      })
    })
    return result
  }

  private references (_class: Ref<Class<Doc>>, _id: Ref<Doc>,
    _itemClass: Ref<Class<Emb>> | undefined, _itemId: Ref<Emb> | undefined,
    _collectionId: string | undefined, obj: AnyLayout): Reference[] {
    const attributes = this.getTextAttributes(_itemClass === undefined ? _class : _itemClass)
    const backlinks = []
    for (const attr of attributes) {
      backlinks.push(...this.referencesFromMessage(_class, _id, _itemClass, _itemId, _collectionId, attr, (obj as any)[attr]))
    }
    return backlinks
  }

  async tx (ctx: TxContext, tx: Tx): Promise<any> {
    await processTransactions(ctx, tx, this)
  }

  async onCreateTx (ctx: TxContext, tx: CreateTx): Promise<any> {
    const refereces = this.references(tx._objectClass, tx._objectId, undefined, undefined, undefined, tx.attributes)
    if (refereces.length === 0) {
      return
    }
    return await Promise.all(refereces.map(async (d) => {
      await this.storage.tx(ctx, create<Reference>(d._class as Ref<Class<Reference>>, d, d._id))
    }))
  }

  async onAddItemTx (ctx: TxContext, tx: AddItemTx): Promise<any> {
    const refereces = this.references(tx._itemClass, tx._objectId, tx._itemClass, tx._itemId, tx._collection, tx.attributes)
    if (refereces.length === 0) {
      return
    }
    return await Promise.all(refereces.map(async (d) => {
      await this.storage.tx(ctx, create<Reference>(d._class as Ref<Class<Reference>>, d, d._id))
    }))
  }

  async onUpdateTx (ctx: TxContext, update: UpdateTx): Promise<any> {
    // Find current refs for this object
    const refs = (await this.storage.find<Reference>(domains.class.Reference, {
      _sourceId: update._objectId,
      _sourceClass: update._objectClass // TODO: Allow to find with some fields not defined.
    })).filter(m => m._itemClass === undefined) // We only need object references.

    const attributes = this.getTextAttributes(update._objectClass)
    let newRefs = [...refs]
    for (const attr of attributes) {
      const value = update.attributes[attr] as string
      if (value !== undefined) {
        newRefs = newRefs.filter(r => r._sourceField !== attr) // Remove all previous values.
        newRefs.push(...this.referencesFromMessage(update._objectClass, update._objectId, undefined, undefined, undefined, attr, value))
      }
    }

    return await this.diffApply(ctx, refs, newRefs, update._objectSpace)
  }

  async onUpdateItemTx (ctx: TxContext, update: UpdateItemTx): Promise<any> {
    // Find current refs for this object
    const refs = (await this.storage.find<Reference>(domains.class.Reference, {
      _sourceId: update._objectId,
      _sourceClass: update._objectClass,
      _itemClass: update._itemClass,
      _itemId: update._itemId,
      _collection: update._collection
    }))

    const attributes = this.getTextAttributes(update._itemClass)
    let newRefs = [...refs]
    for (const attr of attributes) {
      const value = update.attributes[attr] as string
      if (value !== undefined) {
        newRefs = newRefs.filter(r => r._sourceField !== attr) // Remove all previous values.
        newRefs.push(...this.referencesFromMessage(update._objectClass, update._objectId, update._itemClass, update._itemId, update._collection, attr, value))
      }
    }

    return await this.diffApply(ctx, refs, newRefs, update._objectSpace)
  }

  async onDeleteTx (ctx: TxContext, deleteTx: DeleteTx): Promise<any> {
    // Find current refs for this object to clean all of them. It will also delete all refs from collections.
    const refs = await this.storage.find<Reference>(domains.class.Reference, {
      _sourceId: deleteTx._objectId,
      _sourceClass: deleteTx._objectClass
    })

    return await this.diffApply(ctx, refs, [])
  }

  async onRemoveItemTx (ctx: TxContext, tx: RemoveItemTx): Promise<any> {
    // Find current refs for this object to clean all of them. It will also delete all refs from collections.
    const refs = await this.storage.find<Reference>(domains.class.Reference, {
      _sourceId: tx._objectId,
      _sourceClass: tx._objectClass,
      _itemClass: tx._itemClass,
      _itemId: tx._itemId,
      _collection: tx._collection
    })

    return await this.diffApply(ctx, refs, [])
  }

  private async diffApply (ctx: TxContext, refs: Reference[], newRefs: Reference[], _objectSpace?: Ref<Space>): Promise<void> {
    // Do diff from old refs to remove only missing.
    const deletes: Reference[] = []
    const existing: Reference[] = []

    for (const ref of refs) {
      const refData: any = Object.assign({}, ref)
      delete refData._id

      for (const newRef of newRefs) {
        const newRefData: any = Object.assign({}, newRef)
        delete newRefData._id
        if (!deepEqual(refData, newRefData)) {
          // We had existing link, no op required for it.
          existing.push(newRef)
          break
        }
        // Not found, so let's remove it.
        deletes.push(ref)
      }
    }
    const additions = newRefs.filter(e => !existing.includes(e))
    const stored = Promise.all(additions.map(async (d) => {
      await this.storage.tx(ctx, create<Reference>(d._class as Ref<Class<Reference>>, d, d._id, _objectSpace))
    }))
    const deleted = Promise.all(deletes.map(async (d) => {
      await this.storage.tx(ctx, remove(d._class, d._id, _objectSpace))
    }))
    await Promise.all([stored, deleted])
  }
}
