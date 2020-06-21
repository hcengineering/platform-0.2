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

import { Platform, Resource } from '@anticrm/platform'

import business, { BusinessObject, BusinessService } from '.'
import { Instance, Ref, Class, Session, Values } from '@anticrm/platform-core'
import ui from '@anticrm/platform-ui'
import { Account, User } from '.'

console.log('Plugin `business` loaded')
/*!
 * Anticrm Platform™ Business Objects™ Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<BusinessService> => {
  console.log('Plugin `contact` started')

  function getText (this: Instance<BusinessObject>): Promise<string | undefined> {
    const session = this.getSession()
    return session.getInstance(this._class).then(clazz =>
      session.as(clazz, ui.class.ClassUIDecorator)
    ).then(clazz => clazz.label)
  }

  function getImage (this: Instance<BusinessObject>): Promise<Resource<string> | undefined> {
    const session = this.getSession()
    return session.getInstance(this._class).then(clazz =>
      session.as(clazz, ui.class.ClassUIDecorator)
    ).then(clazz => clazz.icon as Resource<string> | undefined)
  }

  platform.setResource(business.method.BusinessObject_getText, getText)
  platform.setResource(business.method.BusinessObject_getImage, getImage)

  function newBusinessObject<B extends BusinessObject> (session: Session, _class: Ref<Class<B>>, values: Values<Omit<B, keyof BusinessObject>>, _id?: Ref<B>): Promise<Instance<B>> {
    const v = {
      createdOn: new Date(), createdBy: '' as Ref<Account>, onBehalfOf: '' as Ref<User>,
      ...values
    } as any
    return session.newInstance(_class, v, _id)
  }

  return {
    newBusinessObject
  }
}