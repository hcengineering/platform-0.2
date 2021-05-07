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

/* eslint-env jest */

import { Status, Severity, identify, OK, unknownError } from '@anticrm/status'

import { Metadata, getMetadata, loadMetadata, setMetadata } from '../metadata'
import { Plugin, Service, getPlugin, addLocation } from '../plugin'
import { Resource, getResource, getResourceInfo, peekResource, setResource } from '../resource'
import {
  addEventListener,
  removeEventListener,
  broadcastEvent,
  setPlatformStatus,
  monitor,
  PlatformEvent
} from '../event'

import {
  plugin1,
  plugin1State,
  descriptor1,
  plugin2State,
  descriptor2,
  plugin3,
  descriptor3,
  descriptorBad
} from './shared'

type AnyPlugin = Plugin<Service>

type ExtractType<T, X extends Record<string, Metadata<T>>> = {
  [P in keyof X]: X[P] extends Metadata<infer Z> ? Z : never
}

describe('platform', () => {

  it('should raise exception for unknown location', async () => {
    const p1 = getPlugin(plugin1)
    return await expect(p1).rejects.toThrowError('plugin1')
  })

  it('should resolve plugin', async () => {
    addLocation(descriptor1, async () => await import('./plugin1'))
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    const p1 = getPlugin(plugin1)
    expect(p1).toBeInstanceOf(Promise)
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    await p1
    expect(plugin1State.parsed).toBe(true)
    expect(plugin1State.started).toBe(true)
  })

  it('should not resolve resource (no plugin location)', async () => {
    const res = getResource('resource:NotExists.Resource' as Resource<string>)
    return await expect(res).rejects.toThrowError('no location provided')
  })

  it('should resolve resource', async () => {
    addLocation(descriptor2, async () => await import('./plugin2'))
    expect(plugin2State.parsed).toBe(false)
    expect(plugin2State.started).toBe(false)
    const resolved = getResource('resource2:plugin2.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    // get again to check repeated getting
    const resource = await getResource('resource2:plugin2.Resource' as Resource<string>)
    expect(resource).toBe('hello resource2:My.Resource')
    expect(plugin2State.parsed).toBe(true)
    expect(plugin2State.started).toBe(true)
  })

  it('should resolve resource second time', async () => {
    const resolved = getResource('resource2:plugin2.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    const resource = await resolved
    expect(resource).toBe('hello resource2:My.Resource')
  })

  it('should fail to resolve wrong resource', async () => {
    const wrongResource = 'resource_wrong:plugin2.Resource' as Resource<string>
    const res = getResource(wrongResource)
    return await expect(res).rejects.toThrowError('resource not loaded')
  })

  it('should fail to load bad plugin', async () => {
    addLocation(descriptorBad, async () => await import('./badplugin'))
    const wrongResource = 'resource_wrong:badplugin.Resource' as Resource<string>
    const res = getResource(wrongResource)
    return await expect(res).rejects.toThrowError('Bad plugin')
  })

  it('should inject dependencies', async () => {
    addLocation(descriptor3, async () => await import('./plugin3'))
    const plugin = await getPlugin(plugin3)
    const deps = (plugin as any).deps
    expect(deps.plugin1.id).toBe('plugin1')
    expect(deps.plugin2.id).toBe('plugin2')
  })

  it('should fail to get resource info', () => {
    expect(() => getResourceInfo('bad resource definition' as Resource<string>)).toThrowError(
      'invalid resource id format'
    )
  })

  it('should peek resource', () => {
    const resource = 'resource' as Resource<string>
    expect(peekResource(resource)).toBeUndefined()
    setResource(resource, 'value')
    expect(peekResource(resource)).toBe('value')
  })

  it('should set resource', async () => {
    setResource('xxx' as Resource<string>, 'meta-xxx')
    const resource = await getResource('xxx' as Resource<string>)
    expect(resource).toBe('meta-xxx')
  })

  it('should load metadata', () => {
    const ids = identify('test' as AnyPlugin, {
      meta: {
        M1: '' as Metadata<string>,
        M2: 'my-id' as Metadata<string>
      }
    })

    loadMetadata(ids.meta, {
      M1: 'hey',
      M2: 'there'
    })

    expect(getMetadata(ids.meta.M1)).toBe('hey')
    expect(getMetadata(ids.meta.M2)).toBe('there')
  })

  it('should fail to load metadata', () => {
    const ids = identify('test' as AnyPlugin, {
      meta: {
        M1: 'flag' as Metadata<boolean>
      }
    })

    expect(() => loadMetadata(ids.meta, {} as ExtractType<unknown, { M1: Metadata<boolean> }>)).toThrowError() // eslint-disable-line @typescript-eslint/consistent-type-assertions
  })

  it('should set metadata', () => {
    const m1 = '' as Metadata<string>
    const m2 = 'm2' as Metadata<string>

    setMetadata(m1, 'hello')
    setMetadata(m2, 'again')

    expect(getMetadata(m1)).toBe('hello')
    expect(getMetadata(m2)).toBe('again')
  })

  it('should call event listener', async () => {
    let listenerCalled = false
    const myEvent = 'MyEvent'
    const myData = 'test-data'
    const myEventListener = async function (event: string, data: any): Promise<void> {
      listenerCalled = true
      expect(event).toBe(myEvent)
      expect(data).toBe(myData)
      return await Promise.resolve()
    }

    addEventListener(myEvent, myEventListener)
    await broadcastEvent(myEvent, myData)
    expect(listenerCalled).toBe(true)

    // remove listener to avoid calls from other tests
    removeEventListener(myEvent, myEventListener)
  })

  it('should call many event listeners', async () => {
    class TestEventListener {
      readonly eventName: string
      readonly eventData: string
      isCalled: boolean
      listener: (event: string, data: string) => Promise<void>

      constructor (eventName: string, eventData: string) {
        this.eventName = eventName
        this.eventData = eventData
        this.isCalled = false

        this.listener = async (event: string, data: any): Promise<void> => {
          this.isCalled = true
          expect(event).toBe(this.eventName)
          expect(data).toBe(this.eventData)
          return await Promise.resolve()
        }
      }

      startListen (): void {
        addEventListener(this.eventName, this.listener)
      }

      stopListen (): void {
        removeEventListener(this.eventName, this.listener)
      }

      checkCalled (): void {
        expect(this.isCalled).toBe(true)
        this.isCalled = false // reset flag for futher checks
      }

      checkNotCalled (): void {
        expect(this.isCalled).toBe(false)
      }
    }

    const event1 = 'MyEvent1'
    const event2 = 'MyEvent2'
    const data1 = 'data1'
    const data2 = 'data2'

    const firstListenerForEvent1 = new TestEventListener(event1, data1)
    const secondListenerForEvent1 = new TestEventListener(event1, data1)
    const firstListenerForEvent2 = new TestEventListener(event2, data2)
    const secondListenerForEvent2 = new TestEventListener(event2, data2)

    firstListenerForEvent1.startListen()
    secondListenerForEvent1.startListen()
    firstListenerForEvent2.startListen()
    secondListenerForEvent2.startListen()

    await broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    await broadcastEvent(event2, data2)
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkCalled()
    secondListenerForEvent2.checkCalled()

    await broadcastEvent('ArbitraryEvent', 'anydata')
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    secondListenerForEvent1.stopListen()

    await broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    firstListenerForEvent1.stopListen()
    firstListenerForEvent2.stopListen()
    secondListenerForEvent2.stopListen()

    await broadcastEvent(event1, data1)
    await broadcastEvent(event2, data2)

    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()
  })

  async function testSetPlatformStatus (status: Status | Error, expectedSeverity: Severity): Promise<void> {
    let listenerCalled = false
    const listener = async function (event: string, data: any): Promise<void> {
      listenerCalled = true
      expect(event).toBe(PlatformEvent)
      expect(data).toBeInstanceOf(Status)
      expect(data.severity).toBe(expectedSeverity)
    }

    addEventListener(PlatformEvent, listener)
    await setPlatformStatus(status)
    expect(listenerCalled).toBeTruthy()

    // remove listener to avoid calls from other tests
    removeEventListener(PlatformEvent, listener)
  }

  it('should set error platform status', async () => {
    return await testSetPlatformStatus(new Error('baga'), Severity.ERROR)
  })

  it('should set custom platform status', async () => {
    return await testSetPlatformStatus(OK, Severity.OK)
  })

  it('should throw monitor error', async () => {
    return await expect(monitor(OK, Promise.reject(new Error('dummy')))).rejects.toThrowError('dummy') // eslint-disable-line @typescript-eslint/no-floating-promises
  })

  it('should remove listener inexistent type of the event', () => {
    removeEventListener('xxx', {} as any)
  })

  it('should create unknown error', () => {
    const status = unknownError(new Error('something')) as Status<{message: string}>
    expect(status.severity).toBe(Severity.ERROR)
    expect(status.params.message).toBe('something')
  })
})
