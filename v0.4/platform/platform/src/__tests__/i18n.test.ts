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

import { Code as StatusCode, Component, identify, Severity, Status } from '@anticrm/status'
import { Code as PlatformCode } from '../status'

import { addStringsLoader, IntlString, translate } from '../i18n'
import { addEventListener, PlatformEvent, removeEventListener } from '../event'

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

  it('should emit status and return id when no loader', async (done) => {
    const component = 'component-for-no-loader'
    const message = `${component}.id`

    const checkStatus = new Status(Severity.ERROR, PlatformCode.NoLoaderForStrings, { component })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
      done()
    }
    addEventListener(PlatformEvent, eventListener)
    const translated = await translate(message as IntlString, {})
    expect(translated).toBe(message)
    removeEventListener(PlatformEvent, eventListener)
  })

  it('should emit status and return id when bad loader', async (done) => {
    const component = 'component-for-bad-loader'
    const message = `${component}.id`
    const errorMessage = 'bad loader'
    addStringsLoader(component as Component, (locale: string) => {
      throw new Error(errorMessage)
    })

    const checkStatus = new Status(Severity.ERROR, StatusCode.UnknownError, { message: errorMessage })
    const eventListener = async (event: string, data: any): Promise<void> => {
      await expect(data).toEqual(checkStatus)
      done()
    }
    addEventListener(PlatformEvent, eventListener)
    const translated = await translate(message as IntlString, {})
    expect(translated).toBe(message)
    removeEventListener(PlatformEvent, eventListener)
  })

  it('should cache error', async (done) => {
    const component = 'component'
    const message = `${component}.id`
    let status: Status | undefined
    const eventListener = async (event: string, data: any): Promise<void> => {
      if (status === undefined) {
        status = data
        done()
        return
      }

      try {
        expect(data).toBe(status)
        done()
      } catch (e) {
        done(e)
      }
    }

    addEventListener(PlatformEvent, eventListener)
    const t1 = await translate(message as IntlString, {})
    const t2 = await translate(message as IntlString, {})
    expect(t1).toBe(t2)
    removeEventListener(PlatformEvent, eventListener)
  })
})
