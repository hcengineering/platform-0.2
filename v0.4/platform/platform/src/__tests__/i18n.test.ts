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

import { Component, Severity, Status, identify, Code as StatusCode } from '@anticrm/status'
import { Code as PlatformCode } from '../status'

import { addStringsLoader, IntlString, translate } from '../i18n'
import { PlatformEvent, addEventListener } from '../event'

const TestComponent = 'test-strings' as Component

const strings =  identify(TestComponent, {
  loadingPlugin: '' as IntlString<{ plugin: string }>,
})

describe('i18n', () => {
  it('should translate string', async () => {
    addStringsLoader(TestComponent, async (locale: string) => await import(`./lang/${locale}.json`))
    const translated = await translate(strings.loadingPlugin, { plugin: 'xxx' })
    expect(translated).toBe('Loading plugin <b>xxx</b>...')
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

  it('should emit status when no loader', async () => {
    const component = 'component'
    const message = `${component}.id`

    const checkStatus = new Status(Severity.ERROR, PlatformCode.NoLoaderForStrings, { component })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
    }
    addEventListener(PlatformEvent, eventListener)
    await translate(message as IntlString, {})
  })

  it('should emit status when bad loader', async () => {
    const errorMessage = 'bad loader'
    addStringsLoader('error-loader' as Component, (locale: string) => {
      throw new Error(errorMessage)
    })
    const component = 'error-loader'
    const message = `${component}.id`

    const checkStatus = new Status(Severity.ERROR, StatusCode.UnknownError, { message: errorMessage })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
    }
    addEventListener(PlatformEvent, eventListener)
    await translate(message as IntlString, {})
  })

  it('should return id when no loader', async () => {
    const message = 'component.id'
    const translated = await translate(message as IntlString, {})
    return expect(translated).toBe(message)
  })

  it('should return id when bad loader', async () => {
    addStringsLoader('error-loader' as Component, (locale: string) => {
      throw new Error('bad loader')
    })
    const message = 'component.id'
    const translated = await translate(message as IntlString, {})
    return expect(translated).toBe(message)
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
