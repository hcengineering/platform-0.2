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

import { Obj, Ref, Class } from '@anticrm/platform-core'
import { synthIntlStringId } from '../plugin'

type AttributeTranslation = {
  label?: string
  placeholder?: string
}

type Labels<T extends Obj> = {
  [P in keyof T]?: string | AttributeTranslation
} & { $label?: string, $placeholder?: string }

type ClassRefs = { [key: string]: Ref<Class<Obj>> }

type RefsToLabels<T extends ClassRefs> = {
  [P in keyof T]: T[P] extends Ref<Class<infer X>> ? Labels<X> : never
}

export function modelTranslation<T extends ClassRefs>(refs: T, translations: Partial<RefsToLabels<T>>): Record<string, string> {
  const result = {} as Record<string, string>
  for (const clazz in translations) {
    const classId = refs[clazz]
    const classTranslations = translations[clazz] as Record<string, string>
    if (classTranslations.$label)
      result[synthIntlStringId(classId, 'label') as string] = classTranslations.$label
    if (classTranslations.$placeholder)
      result[synthIntlStringId(classId, 'placeholder') as string] = classTranslations.$placeholder
    for (const key in classTranslations) {
      if (!key.startsWith('$')) {
        const translation = classTranslations[key]
        if (typeof translation === 'object') {
          const attributeTranslation = translation as AttributeTranslation
          if (attributeTranslation.label)
            result[synthIntlStringId(classId, 'label', key) as string] = attributeTranslation.label
          if (attributeTranslation.placeholder)
            result[synthIntlStringId(classId, 'placeholder', key) as string] = attributeTranslation.placeholder
        } else {
          result[synthIntlStringId(classId, 'label', key) as string] = classTranslations[key]
        }
      }
    }
  }
  return result
}
