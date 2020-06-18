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

import { Platform, Resource, Metadata } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, StaticResource, Exert, Property
} from '.'
import { MemDb } from './memdb'
import { ClientService } from '@anticrm/platform-rpc'
import { createSession } from './session'

// TODO: Platform.getResourceInfo
export function attributeKey (_class: Ref<Class<Obj>>, key: string): string {
  const index = _class.indexOf(':')
  const dot = _class.indexOf('.')
  const plugin = _class.substring(index + 1, dot)
  const cls = _class.substring(dot + 1)
  return plugin + '|' + cls + '|' + key
}

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { rpc: ClientService }): Promise<CoreService> => {
  console.log('PLUGIN: started core')

  // C L I E N T

  // const host = platform.getMetadata(core.metadata.WSHost)
  // const port = platform.getMetadata(core.metadata.WSPort)

  const client = deps.rpc //host ? await createClient(host, port) : createNullClient()

  // M E T A M O D E L

  console.log(deps.rpc)

  const modelDb = new MemDb()
  const metaModel = platform.getMetadata(core.metadata.MetaModel) ?? await client.load('model')
  console.log(metaModel)
  modelDb.loadModel(metaModel)

  // C L A S S E S

  // function getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return (clazz._attributes as any)[key]
  // }

  // function getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return getOwnAttribute(clazz, key) ??
  //     (clazz._extends ? getAttribute(get(clazz._extends), key) : undefined)
  // }

  // A D A P T E R S

  // const adapters = new Map<string, Ref<Adapter>[]>()

  // const allAdapters = modelDb.findAll(core.class.Adapter, {})
  // console.log('ALL ADAPTERS:')
  // console.log(allAdapters)
  // allAdapters.forEach((adapter) => {
  //   const key = adapter.from + ':' + adapter.to
  //   const all = adapters.get(key)
  //   if (all) { all.push(adapter._id) }
  //   else { adapters.set(key, [adapter._id]) }
  // })


  // platform.setResource(core.method.Adapter_adapt, async () => { throw new Error('Abstract `adapt` function.') })

  // C O R E  S E R V I C E

  const coreService: CoreService = {
    newSession () { return createSession(platform, modelDb) },
    // getClassHierarchy,
  }

  // C O L L E C T I O N : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(exert: Exert | undefined) {
      if (!exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = exert
    }

    get (target: any, key: PropertyKey): any {
      const value = Reflect.get(target, key)
      const result = this.exert(value)
      return result
    }
  }

  // C O L L E C T I O N : A R R A Y

  class ArrayProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(exert: Exert | undefined) {
      if (!exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = exert
    }

    get (target: any, key: PropertyKey): any {
      const value = Reflect.get(target, key)
      const result = this.exert(value)
      return result
    }
  }

  const Type_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return value => value
  }

  const Metadata_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return ((value: Metadata<any> & Property<any>) => value ? platform.getMetadata(value) : undefined) as Exert
  }

  const Resource_exert = async function (this: Instance<Type<any>>): Promise<Exert> {
    return (async (value: Property<any>) => value ? platform.getResource(value as unknown as Resource<any>) : undefined) as Exert
  }

  const BagOf_exert = async function (this: Instance<BagOf<any>>): Promise<Exert> {
    const off = await this.of
    const exertFactory = off.exert
    if (typeof exertFactory !== 'function') { throw new Error('not a function') }
    const exert = await exertFactory.call(this)
    if (typeof exert !== 'function') { throw new Error('not a function') }
    return (value: PropertyType) => value ? new Proxy(value, new BagProxyHandler(exert)) : undefined
  }

  const InstanceOf_exert = async function (this: Instance<InstanceOf<Emb>>): Promise<Exert> {
    return ((value: Emb) => {
      const result = value ? this.getSession().instantiateEmb(value) : undefined
      return result
    }) as Exert
  }

  const TStaticResource = {
    exert: async function (this: Instance<StaticResource<any>>): Promise<Exert> {
      const resource = (this.__layout._default) as unknown as Resource<(this: Instance<Type<any>>) => Exert>
      if (resource) {
        const resolved = await platform.getResource(resource)
        return () => resolved
      }
      return () => undefined
    }
  }

  platform.setResource(core.native.StaticResource, TStaticResource)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)
  platform.setResource(core.method.Metadata_exert, Metadata_exert)
  platform.setResource(core.method.Resource_exert, Resource_exert)

  return coreService
}

