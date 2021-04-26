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
import { Attribute, Class, Mixin, Obj, Ref, Type } from '@anticrm/core'
import { VDoc } from '@anticrm/domains'
import ui, { AttrModel, ClassModel, ComponentExtension, GroupModel, PresentationService } from '.'
import { CoreService } from '@anticrm/platform-core'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import { I18n } from '@anticrm/platform-i18n'

import ObjectBrowser from './components/internal/ObjectBrowser.svelte'
import Properties from './components/internal/Properties.svelte'

import StringEditor from './components/internal/presenters/value/StringEditor.svelte'
import CheckboxEditor from './components/internal/presenters/value/CheckboxEditor.svelte'
import TablePresenter from './components/internal/presenters/class/TablePresenter.svelte'
import RefPresenter from './components/internal/presenters/value/RefPresenter.svelte'
import ArrayPresenter from './components/internal/presenters/value/ArrayPresenter.svelte'
import VDocCardPresenter from './components/internal/presenters/VDocCardPresenter.svelte'
import CardPresenter from './components/internal/presenters/CardPresenter.svelte'

/*!
 * Anticrm Platform™ Presentation Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform, deps: { core: CoreService, i18n: I18n }): Promise<PresentationService> => {
  const coreService = deps.core
  const i18nService = deps.i18n

  platform.setResource(ui.component.ObjectBrowser, ObjectBrowser)
  platform.setResource(ui.component.Properties, Properties)

  platform.setResource(ui.component.StringPresenter, StringEditor)
  platform.setResource(ui.component.CheckboxPresenter, CheckboxEditor)
  platform.setResource(ui.component.ArrayPresenter, ArrayPresenter)

  platform.setResource(ui.component.TablePresenter, TablePresenter)
  platform.setResource(ui.component.RefPresenter, RefPresenter)
  platform.setResource(ui.component.VDocCardPresenter, VDocCardPresenter)
  platform.setResource(ui.component.CardPresenter, CardPresenter)

  async function getGroupModel (_class: Ref<Class<Obj>>): Promise<GroupModel> {
    const model = coreService.getModel()
    const clazz = model.get(_class)
    if (model.isMixedIn(clazz, ui.mixin.UXObject)) {
      const ux = model.as(clazz, ui.mixin.UXObject)
      const label = await i18nService.translate(ux.label)

      return {
        _class,
        label,
        icon: ux.icon
      }
    } else {
      return {
        _class,
        label: _class as string,
        icon: undefined
      }
    }
  }

  async function getOwnAttrModel (_class: Ref<Class<Obj>>): Promise<AttrModel[]> {
    const result = [] as AttrModel[]
    const model = coreService.getModel()
    const clazz = model.get(_class)

    // if (uxObject) {
    const attributes = clazz._attributes as { [key: string]: Attribute }
    const primary = model.getPrimaryKey(_class)

    // Class doesn't have defined uxObject, so let's generate one.
    for (const key in attributes) {
      const attribute = attributes[key]

      if (model.isMixedIn(attribute, ui.mixin.UXAttribute)) {
        const uxAttribute = model.as(attribute, ui.mixin.UXAttribute)

        const label = await i18nService.translate(uxAttribute.label)
        const placeholder = (uxAttribute.placeholder !== undefined) ? await i18nService.translate(uxAttribute.placeholder) : label
        const icon: Asset | undefined = uxAttribute.icon

        let presenter: AnyComponent = ui.component.StringPresenter // Use string presenter as default one
        if (uxAttribute.presenter !== undefined) {
          presenter = uxAttribute.presenter
        } else {
          // get presenter
          const typeClassId = attribute.type._class
          const typeClass = model.get(typeClassId) as Class<Type>
          if (!model.isMixedIn(typeClass, ui.mixin.Presenter)) {
            console.log(new Error(`no presenter for type '${typeClassId}'`))
            // Use string presenter
          } else {
            presenter = model.as(typeClass, ui.mixin.Presenter).presenter
          }
        }
        result.push({
          key,
          _class,
          icon,
          label,
          placeholder,
          presenter: presenter,
          type: attribute.type,
          primary: primary === key
        })
      } else {
        // get presenter
        const typeClassId = attribute.type._class
        const typeClass = model.get(typeClassId) as Class<Type>
        if (!model.isMixedIn(typeClass, ui.mixin.Presenter)) {
          throw new Error(`no presenter for type '${typeClassId}'`)
        }
        const presenter = model.as(typeClass, ui.mixin.Presenter)
        result.push({
          key,
          _class,
          icon: undefined,
          label: key,
          placeholder: key,
          presenter: presenter.presenter,
          type: attribute.type,
          primary: primary === key
        })
      }
    }
    return result
  }

  abstract class ClassModelBase implements ClassModel {
    filterAttributes (keys: string[]): ClassModel {
      const filter = new Set<string>()
      keys.forEach(key => {
        filter.add(key)
      })
      return new AttributeFilter(this, filter)
    }

    abstract getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined
    abstract getGroups (): GroupModel[]
    abstract getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[]
    abstract getAttributes (): AttrModel[]
    abstract getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined
    abstract getPrimary (): AttrModel | undefined
    abstract filterPrimary (): { model: ClassModel, primary: AttrModel | undefined }
  }

  class TClassModel extends ClassModelBase {
    private readonly attributes: AttrModel[]
    private readonly groups: GroupModel[]

    constructor (groups: GroupModel[], attributes: AttrModel[]) {
      super()
      this.attributes = attributes
      this.groups = groups
    }

    getAttributes (): AttrModel[] {
      return this.attributes
    }

    getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] {
      return this.attributes.filter(attr => attr._class === _class)
    }

    getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined {
      return this.attributes.find(attr => attr.key === key && ((_class !== undefined) ? _class === attr._class : true))
    }

    getGroups (): GroupModel[] {
      return this.groups
    }

    getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined {
      return this.groups.find(group => group._class === _class)
    }

    getPrimary (): AttrModel | undefined {
      return this.attributes.find(attr => attr.primary)
    }

    filterPrimary (): { model: ClassModel, primary: AttrModel | undefined } {
      const primary = this.getPrimary()
      if (primary !== undefined) {
        return {
          model: this.filterAttributes([primary.key]),
          primary
        }
      } else {
        return {
          model: this,
          primary: undefined
        }
      }
    }
  }

  class AttributeFilter extends ClassModelBase {
    private readonly next: ClassModel
    private readonly filter: Set<string>

    constructor (next: ClassModel, filter: Set<string>) {
      super()
      this.next = next
      this.filter = filter
    }

    getAttribute (key: string, _class?: Ref<Class<Obj>>): AttrModel | undefined {
      const result = this.next.getAttribute(key, _class)
      if (result !== undefined) {
        return this.filter.has(result.key) ? undefined : result
      }
    }

    getGroups (): GroupModel[] {
      return this.next.getGroups()
    }

    getGroup (_class: Ref<Class<Obj>>): GroupModel | undefined {
      return this.next.getGroup(_class)
    }

    getOwnAttributes (_class: Ref<Class<Obj>>): AttrModel[] {
      const result = this.next.getOwnAttributes(_class)
      return result.filter(attr => !this.filter.has(attr.key))
    }

    getAttributes (): AttrModel[] {
      const result = this.next.getAttributes()
      return result.filter(attr => !this.filter.has(attr.key))
    }

    getPrimary (): AttrModel | undefined {
      return this.next.getPrimary()
    }

    filterPrimary (): { model: ClassModel, primary: AttrModel | undefined } {
      return this.next.filterPrimary()
    }
  }

  async function getClassModel (_class: Ref<Class<Obj>>, top?: Ref<Class<Obj>>): Promise<ClassModel> {
    const model = coreService.getModel()
    const hierarchy = model.getClassHierarchy(_class, top)
    const groupModels = hierarchy.map(async (_class) => {
      return await getGroupModel(_class)
    })
    const attrModels = hierarchy.map(async (_class) => {
      return await getOwnAttrModel(_class)
    })

    const groups = await Promise.all(groupModels)
    const attributes = await Promise.all(attrModels).then(result => result.reduce((acc, val) => acc.concat(val), []))

    return new TClassModel(groups, attributes)
  }

  function getComponentExtension (_class: Ref<Class<Obj>>, extension: Ref<Mixin<ComponentExtension<VDoc>>>): AnyComponent | undefined {
    const model = coreService.getModel()
    let itClass: Ref<Class<Obj>> | undefined = _class
    while (itClass !== undefined) {
      const clazz = model.get(itClass) as Class<VDoc>
      if (model.isMixedIn(clazz, extension)) {
        const properties = model.as(clazz, extension)
        return properties.component
      } else {
        itClass = clazz._extends as Ref<Class<Obj>>
      }
    }
    console.log('ERROR: detail form not mixed in: ', _class)
    return undefined
  }

  return Promise.resolve({
    getClassModel,
    getComponentExtension
  })
}
