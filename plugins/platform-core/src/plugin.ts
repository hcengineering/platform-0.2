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
import { Obj, Doc, Ref, Class, Emb, Property } from '@anticrm/platform'
import { Layout, LayoutType } from '@anticrm/memdb'
import core, { CoreService, InstanceOf, Instance, StaticResource, Session, Exert, BagOf, Type } from '.'

import { MemDb } from '@anticrm/memdb'
import { CoreProtocol, Response, CommitInfo } from '@anticrm/rpc'

import { RpcService } from '@anticrm/platform-rpc'
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
export default async (platform: Platform, deps: { rpc: RpcService }): Promise<CoreService> => {
  console.log('PLUGIN: started core')

  // R P C

  const rpc = deps.rpc

  const coreProtocol: CoreProtocol = {
    load: () => platform.task(`Загружаю данные домена`, rpc.request('load', [])),
    commit: (info: CommitInfo) => platform.task(`Сохраняю изменения`, rpc.request('commit', info)),
    find: <T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>) =>
      platform.task(`Загружаю информацию о`, rpc.request('find', _class, query)),
    delete: <T extends Doc> (_class: Ref<Class<T>>, query: Partial<T>) =>
      platform.task(`Удаляю`, rpc.request('delete', _class, query))
  }

  // M E T A M O D E L

  const modelDb = new MemDb()
  const metaModel = await coreProtocol.load()
  modelDb.loadModel(metaModel)

  // C O R E  S E R V I C E

  const sessions = [] as Session[]

  rpc.addEventListener((response: Response<unknown>) => {
    console.log('FOREIGN transaction received')
    const commitInfo = response.result as CommitInfo
    broadcastXact(commitInfo)
  })

  function broadcastXact (info: CommitInfo, originator?: Session) {
    for (const doc of info.created) {
      modelDb.add(doc)
    }
    for (const session of sessions) {
      console.log('broadcasting to ' + sessions.length + ' sessions')
      if (session !== originator) {
        session.acceptXact(info)
      }
    }
  }

  function closeSession (session: Session) {
    sessions.splice(sessions.indexOf(session), 1)
  }

  const coreService: CoreService = {
    newSession () {
      const session = createSession(platform, modelDb, coreProtocol, broadcastXact, closeSession)
      sessions.push(session)
      return session
    }
  }

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

  // C O L L E C T I O N : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert<any>

    constructor(exert: Exert<any> | undefined) {
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
    private exert: Exert<any>

    constructor(exert: Exert<any> | undefined) {
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

  const Type_exert = async function (this: Instance<Type<any>>): Promise<Exert<any>> {
    return value => value
  }

  const Type_hibernate = function (this: Instance<Type<any>>, value: any): LayoutType {
    return value
  }

  const Metadata_exert = async function (this: Instance<Type<any>>): Promise<Exert<any>> {
    return ((value: Metadata<any> & Property<any>) => value ? platform.getMetadata(value) : undefined) as Exert<any>
  }

  const Resource_exert = async function (this: Instance<Type<any>>): Promise<Exert<any>> {
    return (async (value: LayoutType) => value ? platform.getResource(value as unknown as Resource<any>) : undefined) as Exert<any>
  }

  const BagOf_exert = async function (this: Instance<BagOf<any>>): Promise<Exert<any>> {
    const off = await this.of
    const exertFactory = off.exert
    if (typeof exertFactory !== 'function') { throw new Error('not a function') }
    const exert = await exertFactory.call(this)
    if (typeof exert !== 'function') { throw new Error('not a function') }
    return (value: LayoutType) => value ? new Proxy(value, new BagProxyHandler(exert)) : undefined
  }

  const InstanceOf_exert = async function (this: Instance<InstanceOf<Emb>>): Promise<Exert<any>> {
    return ((value: LayoutType) => {
      const result = value ? this.getSession().instantiateEmb(value as Layout<Obj>) : undefined
      return result
    }) as Exert<any>
  }

  const TStaticResource = {
    exert: async function (this: Instance<StaticResource<any>>): Promise<Exert<any>> {
      const resource = (this.__layout as Layout<Type<any>>)._default as unknown as Resource<(this: Instance<Type<any>>) => Exert<any>>
      if (resource) {
        const resolved = await platform.getResource(resource)
        return () => resolved
      }
      return () => undefined
    },
    hibernate: function (this: Instance<StaticResource<any>>, value: any): LayoutType {
      throw new Error('cant change static resource')
    }
  }

  const Date_exert = async function (this: Instance<Type<Date>>): Promise<Exert<Date>> {
    return value => new Date(value as number)
  }

  const Date_hibernate = function (this: Instance<Type<Date>>, value: Date): LayoutType {
    return value.getTime()
  }

  platform.setResource(core.native.StaticResource, TStaticResource)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.Type_hibernate, Type_hibernate)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)
  platform.setResource(core.method.Metadata_exert, Metadata_exert)
  platform.setResource(core.method.Resource_exert, Resource_exert)

  platform.setResource(core.method.Date_exert, Date_exert)
  platform.setResource(core.method.Date_hibernate, Date_hibernate)

  return coreService
}

