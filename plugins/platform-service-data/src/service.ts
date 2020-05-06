//
// Copyright © 2020 Andrey Platov <andrey.v.platov@gmail.com>
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

import { Platform, Metadata } from '@anticrm/platform'
import { Session, Query } from '..'
import core, { Obj, Doc, Ref, Bag, Class, Type, Mixin, Instance, AnyType, SysCall, AnyFunc, Layout, PropertyType, SessionProto } from '..'
import { MemDb } from './memdb'

class InstanceProxy<T extends Obj> {
  __layout: Obj
  __proto: T

  constructor(layout: Obj, proto: T) {
    this.__layout = layout
    this.__proto = proto
  }
}

class InstanceProxyHandler implements ProxyHandler<InstanceProxy<Obj>> {
  private session: MemSession

  constructor(session: MemSession) {
    this.session = session
  }

  protected getFromLayout(target: InstanceProxy<Obj>, key: PropertyKey, receiver: any) {
    return Reflect.get(target.__layout, key, receiver)
  }

  get(target: InstanceProxy<Obj>, key: string, receiver: any): any {
    let value = this.getFromLayout(target, key, receiver)
    if (!value) {
      value = Reflect.get(target.__proto, key, receiver)
    }
    if (!value) return value

    /// instantiate type

    //    const clazz = this.session.memdb.get(this.getFromLayout(target, '_class', receiver))

    if (!key.startsWith('_')) {
      // const _class = this.getFromLayout(target, '_class', receiver)
      // const clazz = this.session.memdb.get(_class) as Class<Obj>
      // console.log('get key: ', key, ' class: ', _class)
      // const attributes = clazz.attributes
      // const attr = attributes[key]
      // if (attr) {
      //   console.log(attr)
      //   const type = this.session.memdb.get(attr._class)
      //   console.log(type)
      //   console.log('exert:')
      //   console.log(type.attributes.exert)
      // } else {
      //   console.log('UNDEFINED')
      // }
    }

    ///

    if (typeof value === 'object' && value.hasOwnProperty('_class')) {
      return this.session.instantiate(value)
    }
    return value
  }
}

class MixinProxy<M extends I, I extends Doc> extends InstanceProxy<M> {
  __instance: I

  constructor(layout: Obj, proto: M, instance: I) {
    super(layout, proto)
    this.__instance = instance
  }
}

class MixinProxyHandler extends InstanceProxyHandler implements ProxyHandler<MixinProxy<Doc, Doc>> {

  constructor(memdb: MemSession) {
    super(memdb)
  }

  protected getFromLayout(target: MixinProxy<Doc, Doc>, key: PropertyKey, receiver: any) {
    return super.getFromLayout(target, key, receiver) ??
      Reflect.get(target.__instance, key, receiver)
  }
}

//////////

export class MemSession implements Session {

  readonly platform: Platform
  private memdb: MemDb
  private prototypes = new Map<Ref<Class<Obj>>, Object>()
  readonly instanceProxy: InstanceProxyHandler
  readonly mixinProxy: MixinProxyHandler

  constructor(platform: Platform) {
    this.platform = platform
    this.memdb = new MemDb()
    this.instanceProxy = new InstanceProxyHandler(this)
    this.mixinProxy = new MixinProxyHandler(this)
  }

  private createPropertyDescriptors(attributes: Bag<Type<PropertyType>>) {
    const result = {} as { [key: string]: PropertyDescriptor }
    for (const key in attributes) {
      if (key.startsWith('_')) {
        result[key] = {
          get(this: Instance<Obj>) {
            return (this.__layout as any)[key]
          },
          enumerable: true,
        }
      } else {
        const attribute = attributes[key]
        const instance = this.instantiate(attribute)

        result[key] = {
          get(this: Instance<Obj>) {
            const value = (this.__layout as any)[key] ?? attribute._default
            return instance.exert(value)
          },
          enumerable: true,
        }
      }
    }
    return result
  }

  private createPrototype<T extends Obj>(clazz: Ref<Class<T>>) {
    console.log('createPrototype:' + clazz)
    const classInstance = this.memdb.get(clazz) as Class<Obj>
    const extend = classInstance.extends
    const parent = extend ? this.getPrototype(extend) : Object.prototype // TODO: some proto in case of missed `extends`
    const proto = Object.create(parent)

    let descriptors: Record<string, PropertyDescriptor>
    if (classInstance.native) {
      const nativeImpl = this.platform.getMetadata(classInstance.native)
      descriptors = Object.getOwnPropertyDescriptors(nativeImpl)
    } else {
      descriptors = this.createPropertyDescriptors(classInstance.attributes)
    }

    this.prototypes.set(clazz, proto)
    return proto
  }

  getPrototype<T extends Obj>(clazz: Ref<Class<T>>): T {
    return this.prototypes.get(clazz) ?? this.createPrototype(clazz)
  }

  instantiate<T extends Obj>(obj: T): Instance<T> {
    const instance = Object.create(this.getPrototype(obj._class)) as Layout<T>
    instance.__layout = obj
    return instance as Instance<T>
  }

  getInstance<T extends Doc>(ref: Ref<T>): Instance<T> {
    return this.instantiate(this.memdb.get(ref))
  }

  newInstance<T extends Obj>(clazz: Ref<Class<T>>): T {
    throw new Error('not implemented')
  }

  ////

  find<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T>[] {
    const layouts = this.memdb.findAll(clazz, query)
    return layouts.map(layout => this.instantiate(layout))
  }

  findOne<T extends Doc>(clazz: Ref<Class<T>>, query: Query<T>): Instance<T> | undefined {
    const result = this.find(clazz, query)
    return result.length > 0 ? result[0] : undefined
  }

  ////

  loadModel(docs: Doc[]): void {
    this.memdb.load(docs)
  }

  ////

  mixin<M extends I, I extends Doc>(doc: Ref<I>, mixinClass: Ref<Mixin<M>>): M {
    // const layout = this.memdb.get(doc) as I
    // let mixins = layout._mixins // TODO: hide _mixin or make Layout recursive
    // if (!mixins) {
    //   mixins = []
    //   layout._mixins = mixins
    // }
    // const mixin = { _class: mixinClass }
    // mixins.push(mixin)

    // const proxy = new MixinProxy(mixin, this.getPrototype(mixinClass) as M, layout)
    // return new Proxy(proxy, this.mixinProxy) as unknown as M
    return {} as M
  }

}

/// Native Prototypes

class SessionProtoImpl implements SessionProto {
  getSession(): Session { throw new Error('not implemented') }
}

class ObjProto extends SessionProtoImpl implements Instance<Obj> {
  __layout!: Obj
  get _class() { return this.__layout._class }
  toIntlString(plural?: number) { return 'hey ' + plural }
}

class RefToProto extends ObjProto implements Instance<AnyType> {
  __layout!: AnyType
  get _default() { return this.__layout._default }
  exert(value: PropertyType) { return value ?? this._default }
}

class SysCallProto extends ObjProto implements Instance<AnyType> {
  __layout!: AnyType
  get _default() { return this.__layout._default }
  exert(value: PropertyType) {
    const session = this.getSession() as MemSession
    return session.platform.getMetadata((value as SysCall<AnyFunc>) ?? this._default)
  }
}

export default (platform: Platform): Session => {
  platform.setMetadata(core.native.Object, ObjProto.prototype)
  platform.setMetadata(core.native.RefTo, RefToProto.prototype)
  platform.setMetadata(core.native.SysCall, SysCallProto.prototype)

  return new MemSession(platform)
}