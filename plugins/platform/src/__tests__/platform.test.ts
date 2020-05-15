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

import { Platform, identify, AnyPlugin, Resource, Plugin, PluginId, plugin } from '..'

import { plugin1, descriptor1, plugin1State } from './shared'
import { plugin2, descriptor2, plugin2State } from './shared'


describe('platform', () => {

  const platform = new Platform()

  it('should identify resources', () => {
    const ids = identify('test' as AnyPlugin, {
      resource: {
        MyString: '' as Resource<string>
      },
    })
    expect(ids.resource.MyString).toBe('resource:test.MyString')
  })

  it('should raise exception for unknown location', () => {
    const p1 = platform.getPlugin(plugin1)
    expect(p1).rejects.toThrowError('no descriptor for: plugin1')
  })

  it('should resolve plugin', () => {
    platform.addLocation(descriptor1, () => import('./plugin1'))
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    const p1 = platform.getPlugin(plugin1)
    expect(p1).toBeInstanceOf(Promise)
    expect(plugin1State.parsed).toBe(false)
    expect(plugin1State.started).toBe(false)
    return p1.then(plugin => {
      expect(plugin1State.parsed).toBe(true)
      expect(plugin1State.started).toBe(true)
    })
  })

  it('should not resolve resource', () => {
    const resolve = () => platform.resolve('resource:My.Resource' as Resource<string>)
    expect(resolve).toThrowError('no provider')
  })

  it('should not resolve resource', () => {
    // @ts-expect-error
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

  it('should inject dependencies', () => {

  })

})
