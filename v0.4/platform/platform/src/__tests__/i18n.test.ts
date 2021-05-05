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

import { Component } from '@anticrm/status'

import { addStringsLoader, IntlString, translate } from '../i18n'
import strings, { TestComponent } from './strings'

describe('i18n', () => {
  it('should translate string', async () => {
    addStringsLoader(TestComponent, async (locale: string) => await import(`./lang/${locale}.json`))
    const translated = await translate(strings.loadingPlugin, { plugin: 'xxx' })
    expect(translated).toBe('Loading plugin <b>xxx</b>...')
    const translated2 = await translate(strings.predefinedID, {})
    expect(translated2).toBe('some string')
  })

  it('should return id when no translation found', async () => {
    const id = (TestComponent + '.inexistent') as IntlString
    const inexistent = await translate(id, {})
    expect(inexistent).toBe(id)
  })

  it('should cache translated string', async () => {
    const translated = await translate(strings.loadingPlugin, { plugin: 'xxx' })
    expect(translated).toBe('Loading plugin <b>xxx</b>...')
  })

  it('should return status when no loader', async () => {
    const translated = translate('component.id' as IntlString, {})
    return await expect(translated).rejects.toThrowError("ERROR in 'platform' code: 3")
  })

  it('should return status when bad loader', async () => {
    addStringsLoader('error-loader' as Component, (locale: string) => {
      throw new Error('bad loader')
    })
    const translated = translate('error-loader.id' as IntlString, {})
    return expect(translated).rejects.toThrowError("ERROR in 'platform' code: 1")
  })

  it('should cache error', async () => {
    const translated = translate('error-loader.id' as IntlString, {})
    return await expect(translated).rejects.toThrowError("ERROR in 'platform' code: 1")
  })
})
