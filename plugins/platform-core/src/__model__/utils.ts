//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { Ref, Class, Obj, Doc, Content } from '..'
import { IntlString } from '@anticrm/platform-core-i18n'
import { classLabelId, attributeLabelId } from '../utils'
import { mixinPropertyKey } from '../utils'
import { mergeWith } from 'lodash'

type Labels<T extends Obj> = {
  [P in keyof T]?: string
} & { $label: string }

type ClassRefs = { [key: string]: Ref<Class<Obj>> }

type RefsToLabels<T extends ClassRefs> = {
  [P in keyof T]: T[P] extends Ref<Class<infer X>> ? Labels<X> : never
}

export function modelTranslation<T extends ClassRefs>(refs: T, translations: RefsToLabels<T>): Record<string, string> {
  const result = {} as Record<string, string>
  for (const clazz in translations) {
    const classId = refs[clazz]
    const classTranslations = translations[clazz] as Record<string, string>
    const rootId = classLabelId(classId) as string
    result[rootId] = classTranslations.$label
    for (const key in classTranslations) {
      if (!key.startsWith('$')) {
        result[attributeLabelId(classId, key) as string] = classTranslations[key]
      }
    }
  }
  return result
}

export function verifyTranslation(ids: Record<string, IntlString>, translations: Record<string, string>): Record<string, string> {
  const result = {} as Record<string, string>
  for (const key in ids) {
    const translated = translations[key]
    if (translated) {
      const id = ids[key]
      result[id as string] = translated
    } else
      throw new Error(`no translation for ${key}`)
  }
  return result
}

type PluginIds = { [key: string]: { [key: string]: any } }

export function mergeIds<A extends PluginIds, B extends PluginIds>(a: A, b: B): A & B {
  return mergeWith({}, a, b, (value) => {
    if (typeof value === 'string') {
      throw new Error('attempting to overwrite ' + value)
    }
  })
}

