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

import { Status, Severity } from '@anticrm/status'

import { Metadata, getMetadata, loadMetadata, setMetadata } from '../metadata'
import { Plugin, Service, identify, getPlugin, addLocation } from '../plugin'
import { Resource, getResource, getResourceInfo, peekResource, setResource } from '../resource'
import { addEventListener, removeEventListener, broadcastEvent, PlatformStatus, setPlatformStatus, monitor } from '../event'

import { plugin1, plugin1State, descriptor1 } from './shared'
import { plugin2, plugin2State, descriptor2 } from './shared'
import { plugin3, plugin3State, descriptor3 } from './shared'
import { descriptorBad } from './shared'

type AnyPlugin = Plugin<Service>

type ExtractType<T, X extends Record<string, Metadata<T>>> = {
  [P in keyof X]: X[P] extends Metadata<infer Z> ? Z : never
}

describe('platform', () => {

  it('should identify resources', () => {
    const ids = identify('test' as AnyPlugin, {
      resource: {
        MyString: '' as Metadata<string>,
        FixedId: 'my-id' as Metadata<string>
      }
    })
    expect(ids.resource.MyString).toBe('resource:test.MyString')
    expect(ids.resource.FixedId).toBe('my-id')
  })

  it('should raise exception for unknown location', () => {
    const p1 = getPlugin(plugin1)
    expect(p1).rejects.toThrowError('plugin1') // eslint-disable-line @typescript-eslint/no-floating-promises
  })

  it('should resolve plugin', async () => {
    addLocation(descriptor1, () => import('./plugin1'))
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

  it('should not resolve resource (no plugin location)', () => {
    const res = getResource('resource:NotExists.Resource' as Resource<string>)
    expect(res).rejects.toThrowError('no location provided')
  })

  it('should resolve resource', async () => {
    addLocation(descriptor2, async () => await import('./plugin2'))
    expect(plugin2State.parsed).toBe(false)
    expect(plugin2State.started).toBe(false)
    let resolved = getResource('resource2:plugin2.Resource' as Resource<string>)
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

  it('should fail to resolve wrong resource', () => {
    const wrongResource = 'resource_wrong:plugin2.Resource' as Resource<string>
    const res = getResource(wrongResource)
    expect(res).rejects.toThrowError('resource not loaded')
  })

  it('should fail to load bad plugin', () => {
    addLocation(descriptorBad, () => import('./badplugin'))
    const wrongResource = 'resource_wrong:badplugin.Resource' as Resource<string>
    const res = getResource(wrongResource)
    expect(res).rejects.toThrowError('Bad plugin')
  })

  it('should inject dependencies', async () => {
    addLocation(descriptor3, () => import('./plugin3'))
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

  it('should call event listener', () => {
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
    broadcastEvent(myEvent, myData)
    expect(listenerCalled).toBe(true)

    // remove listener to avoid calls from other tests
    removeEventListener(myEvent, myEventListener)
  })

  it('should call many event listeners', () => {
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

    broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    broadcastEvent(event2, data2)
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkCalled()
    secondListenerForEvent2.checkCalled()

    broadcastEvent('ArbitraryEvent', 'anydata')
    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    secondListenerForEvent1.stopListen()

    broadcastEvent(event1, data1)
    firstListenerForEvent1.checkCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()

    firstListenerForEvent1.stopListen()
    firstListenerForEvent2.stopListen()
    secondListenerForEvent2.stopListen()

    broadcastEvent(event1, data1)
    broadcastEvent(event2, data2)

    firstListenerForEvent1.checkNotCalled()
    secondListenerForEvent1.checkNotCalled()
    firstListenerForEvent2.checkNotCalled()
    secondListenerForEvent2.checkNotCalled()
  })

  function testSetPlatformStatus (status: any, expectedSeverity: Severity, expectedMessage: string): void {
    let listenerCalled = false
    const listener = async function (event: string, data: any): Promise<void> {
      listenerCalled = true
      expect(event).toBe(PlatformStatus)
      expect(data).toBeInstanceOf(Status)
      expect(data.severity).toBe(expectedSeverity)
      expect(data.code).toBe(0)
      expect(data.message).toBe(expectedMessage)
      return await Promise.resolve()
    }

    addEventListener(PlatformStatus, listener)
    setPlatformStatus(status)
    expect(listenerCalled).toBeTruthy()

    // remove listener to avoid calls from other tests
    removeEventListener(PlatformStatus, listener)
  }

  it('should set string platform status', () => {
    testSetPlatformStatus('custom string', Severity.INFO, 'custom string')
  })

  it('should set error platform status', () => {
    testSetPlatformStatus(new Error('baga'), Severity.ERROR, 'baga')
  })

  it('should set custom platform status', () => {
    testSetPlatformStatus(new Status(Severity.OK, 0, 'custom message'), Severity.OK, 'custom message')
  })

  it('should set unknown platform status', () => {
    testSetPlatformStatus({ x: 'y' }, Severity.WARNING, 'Unknown status: [object Object]')
  })

  it('should throw monitor error', () => {
    expect(monitor(new Status(Severity.OK, 0, ''), Promise.reject(new Error('dummy')))).rejects.toThrowError('dummy')
  })

  it('should remove listener inexistent type of the event', () => {
    removeEventListener('xxx', {} as any)
  })

})
