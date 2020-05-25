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

import { Platform } from '@anticrm/platform'
import core, {
  CoreService, Obj, Ref, Class, Doc, EClass, BagOf, InstanceOf, PropertyType,
  Instance, Type, Emb, ResourceType, Property, ResourceProperty, Exert, Session
} from '.'
import { TSession } from './session'

console.log('PLUGIN: parsed core')

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  console.log('PLUGIN: started core')

  // C L A S S E S

  // function getOwnAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return (clazz._attributes as any)[key]
  // }

  // function getAttribute (clazz: Class<Obj>, key: string): Type<any> | undefined {
  //   return getOwnAttribute(clazz, key) ??
  //     (clazz._extends ? getAttribute(get(clazz._extends), key) : undefined)
  // }

  // T Y P E S : B A G

  class BagProxyHandler implements ProxyHandler<any> {
    private exert: Exert

    constructor(type: Instance<Type<any>>) {
      if (!type.exert) {
        throw new Error('bagof: no exert')
      }
      this.exert = type.exert()
    }

    get (target: any, key: string): any {
      return this.exert(Reflect.get(target, key))
    }
  }

  const Type_exert = function (this: Instance<Type<any>>): Exert {
    return value => value
  }

  const BagOf_exert = function (this: Instance<BagOf<any>>): Exert {
    return (value: PropertyType) => new Proxy(value, new BagProxyHandler(this.of))
  }

  const InstanceOf_exert = function (this: Instance<InstanceOf<Emb>>): Exert {
    return ((value: Emb) => this.getSession().instantiateEmb(value)) as Exert
  }

  const TResourceType = {
    exert: function (this: Instance<ResourceType<any>>): Exert {
      const resource = (this.__layout._default) as ResourceProperty<(this: Instance<Type<any>>) => Exert>
      return (value: PropertyType) => resource ? platform.getResource(resource) : undefined
    }
  }

  platform.setResource(core.native.ResourceType, TResourceType)
  platform.setResource(core.method.Type_exert, Type_exert)
  platform.setResource(core.method.BagOf_exert, BagOf_exert)
  platform.setResource(core.method.InstanceOf_exert, InstanceOf_exert)

  return {
    newSession (): Session { return new TSession(platform) }
  }
}

