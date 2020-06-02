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

import { Platform, identify, Plugin, Service, Resource, Metadata } from '..'

import { plugin1, descriptor1, plugin1State, plugin2, descriptor2, plugin2State, plugin3, descriptor3 } from './shared'

type AnyPlugin = Plugin<Service>

describe('platform', () => {
  const platform = new Platform()

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
    const p1 = platform.getPlugin(plugin1)
    expect(p1).rejects.toThrowError('plugin1')
  })

  it('should resolve plugin', () => {
    platform.addLocation(descriptor1, () => import('./plugin1'))
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    const p1 = platform.getPlugin(plugin1)
    expect(p1).toBeInstanceOf(Promise)
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    return p1.then(plugin => { // eslint-disable-line @typescript-eslint/no-unused-vars
      expect(plugin1State.parsed).toBe(true)
      expect(plugin1State.started).toBe(true)
    })
  })

  it('should not resolve resource (no plugin location)', (done) => {
    platform.resolve('resource:NotExists.Resource' as Resource<string>).then(res => { // eslint-disable-line
      expect(true).toBe(false)
      done()
    }).catch(err => {
      expect(err).toBeInstanceOf(Error)
      done()
    })
  })

  it('should not resolve resource (plugin does not have resolve method)', () => {
    platform.setResolver('resource', plugin1)
    const resolved = platform.resolve('resource:My.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    return expect(resolved).rejects.toThrowError('plugin.resolve is not a function')
  })

  it('should resolve resource', () => {
    platform.addLocation(descriptor2, () => import('./plugin2'))
    platform.setResolver('resource2', plugin2)
    expect(plugin2State.parsed).toBe(false)
    expect(plugin2State.started).toBe(false)
    const resolved = platform.resolve('resource2:My.Resource' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    return resolved.then(resource => {
      expect(resource).toBe('hello resource2:My.Resource')
      expect(plugin2State.parsed).toBe(true)
      expect(plugin2State.started).toBe(true)
    })
  })

  it('should resolve resource second time', () => {
    const resolved = platform.resolve('resource2:My.Resource2' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    return resolved.then(resource => {
      expect(resource).toBe('hello resource2:My.Resource2')
    })
  })

  it('should resolve resource to undefined', () => {
    const resolved = platform.resolve('resource2:undefined' as Resource<string>)
    expect(resolved).toBeInstanceOf(Promise)
    return resolved.then(resource => {
      expect(resource).toBeUndefined()
    })
  })

  it('should inject dependencies', () => {
    platform.addLocation(descriptor3, () => import('./plugin3'))
    const p3 = platform.getPlugin(plugin3)
    return p3.then(plugin => {
      const deps = (plugin as any).deps
      expect(deps.plugin1.id).toBe('plugin1')
      expect(deps.plugin2.id).toBe('plugin2')
      expect(typeof deps.plugin2.resolve === 'function').toBeTruthy()
    })
  })

  it('should set metadata', async () => {
    platform.setResource('xxx' as Resource<string>, 'meta-xxx')
    const resource = await platform.getResource('xxx' as Resource<string>)
    expect(resource).toBe('meta-xxx')
  })

  it('should load metadata', () => {
    const ids = identify('test' as AnyPlugin, {
      meta: {
        M1: '' as Metadata<string>,
        M2: 'my-id' as Metadata<string>
      }
    })

    platform.loadMetadata(ids.meta, {
      M1: 'hey',
      M2: 'there'
    })

    expect(platform.getMetadata(ids.meta.M1)).toBe('hey')
    expect(platform.getMetadata(ids.meta.M2)).toBe('there')
  })
})
