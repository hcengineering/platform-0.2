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

import { Obj, Doc, Ref, Class } from '@anticrm/platform-core'
import { synthIntlString } from '../plugin'

import { IntlString } from '..'

// M O D E L  T R A N S L A T I O N S

import { KeysByType } from 'simplytyped'

type StringIds = { [key: string]: IntlString }
type AsStrings<T> = { [P in keyof T]: string }

export function verifyTranslation<T extends StringIds> (ids: T, translations: AsStrings<T>): { [key: string]: string } {
  const result = {} as Record<string, string>
  for (const key in ids) {
    const translated = translations[key]
    if (translated) {
      const id = ids[key]
      result[id] = translated
    } else { throw new Error(`no translation for ${key}`) }
  }
  return result as AsStrings<T>
}

type Refs = { [key: string]: Ref<Doc> }

type L<T extends object> = Partial<Record<KeysByType<T, IntlString | undefined>, string>>
type R2L<T extends object, A extends object> = {
  [P in keyof T]: T[P] extends Ref<infer X> ? L<A> : never
}

/**
 * Helper to load default translations for object attributes.
 *
 * @param refs Refs to objects to translate
 * @param as Treat objects as object of `as` class
 */
export function modelTranslation<T extends Refs, A extends Doc> (refs: T, as: Ref<Class<A>>, translations: Partial<R2L<T, A>>): Record<string, string> {
  const result = {} as Record<string, string>
  for (const clazz in translations) {
    const classId = refs[clazz]
    const classTranslations = translations[clazz] as Record<string, string>

    for (const key in classTranslations) {
      const intl = synthIntlString(classId, key)
      result[intl] = classTranslations[key]
    }
  }
  return result
}

// import contact from '@anticrm/contact/src/__model__'
// import ui, { ClassUIDecorator } from '@anticrm/platform-ui/'


// const x = {} as Partial<R2L<typeof contact.class, ClassUIDecorator<Obj>>>


// const t = modelTranslation(contact.class, ui.class.ClassUIDecorator, {
//   Email: {
//     label: ''
//   }
// })
