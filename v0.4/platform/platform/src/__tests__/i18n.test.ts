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

import { Component, Severity, Status } from '@anticrm/status'

import { addStringsLoader, IntlString, translate } from '../i18n'
import strings, { TestComponent } from './strings'
import { Code } from '../status'
import { PlatformEvent, addEventListener } from '../event'

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

  it('should emmit status when no loader', async () => {
    const component = 'component'
    const message = `${component}.id`

    const checkStatus = new Status(Severity.ERROR, Code.NoLoaderForStrings, { component })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
    }
    addEventListener(PlatformEvent, eventListener)
    await translate(message as IntlString, {})
  })

  it('should emmit status when bad loader', async () => {
    const errorMessage = 'bad loader'
    addStringsLoader('error-loader' as Component, (locale: string) => {
      throw new Error(errorMessage)
    })
    const component = 'error-loader'
    const message = `${component}.id`

    const checkStatus = new Status(Severity.ERROR, Code.UnknownError, { message: errorMessage })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
    }
    addEventListener(PlatformEvent, eventListener)
    await translate(message as IntlString, {})
  })

  it('should cache error', async () => {
    const component = 'error-loader'
    const message = `${component}.id`
    let status: Status | undefined
    const eventListener = async (event: string, data: any): Promise<void> => {
      if (status === undefined) {
        status = data
        return
      }
      await expect(data).toBe(status)
    }
    addEventListener(PlatformEvent, eventListener)
    await translate(message as IntlString, {})
    await translate(message as IntlString, {})
  })
})
