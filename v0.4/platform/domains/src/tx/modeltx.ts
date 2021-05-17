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

import core, { AnyLayout, ArrayOf, AttributeMatch, Class, Model, Obj, Ref } from '@anticrm/core'
import { ObjectSelector, TxOperation, TxOperationKind } from '../tx'
/**
 * Perform update of document attributes
 * @param doc - document to update
 * @param operations - define a set of operations to update for document.
 */
export function updateDocument<T extends Obj> (model: Model, doc: T, operations: TxOperation[]): T {
  for (const op of operations) {
    // We need to find embedded object first
    const match = matchSelector(model, doc._class, doc, op.selector)
    if (match.match) {
      switch (op.kind) {
        case TxOperationKind.Set:
          if (op._attributes !== undefined) {
            model.assign(model.getLayout(match.doc), match.doc._class, op._attributes)
          }
          break
        case TxOperationKind.Push:
          if (match.attrMatch !== undefined) {
            const { attr, key } = match.attrMatch

            const l = (match.doc as unknown) as AnyLayout
            switch (attr.type._class) {
              case core.class.ArrayOf: {
                const attrClass = model.attributeClass((attr.type as ArrayOf).of)
                if (attrClass === undefined) {
                  throw new Error(`Invalid attribute type/class: ${String(attr.type)}`)
                }
                if (op._attributes !== undefined) {
                  l[key] = model.pushArrayValue(l[key], attrClass, op._attributes)
                } else {
                  throw new Error(`Empty _attributes specified: ${String(attr.type)}`)
                }
                break
              }

              default:
                throw new Error(`Invalid attribute type: ${String(attr.type)}`)
            }
          }
          break
        case TxOperationKind.Pull:
          if (match.attrMatch !== undefined) {
            const { attr, key } = match.attrMatch

            const l = (match.parent as unknown) as AnyLayout

            switch (attr.type._class) {
              case core.class.ArrayOf: {
                const parentArray = (l[key] as unknown) as Obj[]
                // We assume it will be found.
                parentArray.splice(parentArray.indexOf(match.value), 1)
                break
              }
              case core.class.InstanceOf: {
                delete (l as any)[key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
                break
              }
            }
          }
          break
      }
    } else {
      throw new Error(`failed to object by query:${String(op.selector)}`)
    }
  }
  return doc
}

export function isValidSelector (selector: ObjectSelector[]): boolean {
  return selector.length > 0
}

/**
 * Perform matching of document with query.
 * {fullMatch} is used as true to match against array with passing objects, it will match for all values.
 * If used as false, it will find at least one match for object with array value.
 */
export function matchSelector (model: Model, _class: Ref<Class<Obj>>, doc: Obj, selector?: ObjectSelector[]): { match: boolean, value?: any, attrMatch?: AttributeMatch, doc: Obj, parent: Obj } {
  if ((selector !== undefined) && isValidSelector(selector)) {
    let current = doc
    let parent = doc
    let currentClass = _class

    for (let segmId = 0; segmId < selector.length; segmId++) {
      const segm = selector[segmId]
      if (segm.key === '') {
        throw new Error('Object selector field should be specified')
      }
      const attr = model.classAttribute(currentClass, segm.key)

      if (segm.pattern === undefined) {
        if (segmId === selector.length - 1) {
          // Last one, we could omit check, since it will be for push operation.
          return { match: true, attrMatch: attr, doc: current, parent }
        }
        throw new Error(`Pattern field for middle selector should be specified ${String(selector)}`)
      }
      const attrClass = model.attributeClass(attr.attr.type)

      // If this is our proxy, we should unwrap it.
      const cany = (current as any)
      const docValue = (cany.__layout !== undefined ? cany.__layout : cany)[attr.key]
      const res = model.matchValue(attrClass, docValue, segm.pattern, false)
      if (res === undefined) {
        throw new Error('failed to match embedded object of value')
      }
      if ((attrClass !== undefined) && model.is(attrClass, core.class.Obj)) {
        parent = current
        current = res.value as Obj
        currentClass = attrClass
      }
      if (segmId === selector.length - 1) {
        return { match: true, value: res.value, doc: current, attrMatch: attr, parent }
      } else {
        // If attribute class is based on doc.
        if ((attrClass !== undefined) && !model.is(attrClass, core.class.Obj)) {
          throw new Error(`failed to match embedded object of value for class ${attrClass} of value ${String(current)}`)
        }
      }
    }
  }
  return { match: true, doc, parent: doc }
}
