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

import core, { Builder, Class$, getClass, loadClassifierChild, Mixin$, Prop, RefTo$ } from '@anticrm/model'

import { Class, Doc, MODEL_DOMAIN, Obj, Ref, Type } from '@anticrm/core'
import { VDoc } from '@anticrm/domains'
import { IntlString } from '@anticrm/platform-i18n'
import { AnyComponent, Asset } from '@anticrm/platform-ui'
import ui, { ComponentExtension, Presenter, UXAttribute, UXObject, Viewlet } from '.'
import { TAttribute, TDoc, TMixin } from '@anticrm/model/src/__model__'

@Mixin$(ui.mixin.UXAttribute, core.class.Attribute)
export class TUXAttribute extends TAttribute implements UXAttribute {
  @Prop()
  key!: string

  @Prop()
  label!: IntlString

  @Prop()
  icon?: Asset

  @Prop()
  placeholder?: IntlString

  @Prop()
  visible!: boolean

  @Prop()
  presenter?: AnyComponent

  @Prop()
  color?: Asset
}

@Mixin$(ui.mixin.Presenter, core.class.Mixin)
export class TPresenter<T extends Type> extends TMixin<T> implements Presenter<T> {
  @Prop()
  presenter!: AnyComponent
}

@Mixin$(ui.mixin.UXObject, core.class.Mixin)
export class TUXObject<T extends Obj> extends TMixin<T> implements UXObject<T> {
  @Prop()
  label!: IntlString

  @Prop()
  icon?: Asset
}

@Mixin$(ui.mixin.DetailForm, core.class.Mixin)
export class TDetailForm<T extends VDoc> extends TMixin<T> implements ComponentExtension<T> {
  @Prop()
  component!: AnyComponent
}

@Mixin$(ui.mixin.LookupForm, core.class.Mixin)
export class TLookupForm<T extends VDoc> extends TMixin<T> implements ComponentExtension<T> {
  @Prop()
  component!: AnyComponent
}

@Mixin$(ui.mixin.CreateForm, core.class.Mixin)
export class TCreateForm<T extends VDoc> extends TMixin<T> implements ComponentExtension<T> {
  @Prop()
  component!: AnyComponent
}

@Mixin$(ui.mixin.CardForm, core.class.Mixin)
export class TCardForm<T extends VDoc> extends TMixin<T> implements ComponentExtension<T> {
  @Prop()
  component!: AnyComponent
}

@Class$(ui.mixin.Viewlet, core.class.Doc, MODEL_DOMAIN)
export class TViewlet extends TDoc implements Viewlet {
  @RefTo$(core.class.Class)
  displayClass!: Ref<Class<Doc>>

  @Prop() label!: IntlString
  @Prop() icon?: Asset
  @Prop() component!: AnyComponent

  @Prop() parameters?: Record<string, any>
}

export function model (S: Builder): void {
  S.add(TUXAttribute, TPresenter, TUXObject, TDetailForm, TLookupForm, TCreateForm, TViewlet, TCardForm)

  S.mixin(core.class.Type, ui.mixin.Presenter, {
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.String, ui.mixin.Presenter, {
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.Number, ui.mixin.Presenter, {
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.Boolean, ui.mixin.Presenter, {
    presenter: ui.component.CheckboxPresenter
  })

  S.mixin(core.class.RefTo, ui.mixin.Presenter, {
    presenter: ui.component.RefPresenter
  })

  S.mixin(core.class.ArrayOf, ui.mixin.Presenter, {
    presenter: ui.component.ArrayPresenter
  })

  S.mixin(core.class.EnumOf, ui.mixin.Presenter, {
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.InstanceOf, ui.mixin.Presenter, {
    presenter: ui.component.StringPresenter
  })

  S.mixin(core.class.VDoc, ui.mixin.CardForm, {
    component: ui.component.VDocCardPresenter
  })

  S.createDocument(ui.mixin.Viewlet, {
    displayClass: core.class.Doc,
    label: 'Table' as IntlString,
    component: ui.component.TablePresenter
  })
}

// A possible set of options
export interface UXOptions {
  // Declare an icon
  icon?: Asset

  // Declare a placeholder
  placeholder?: IntlString

  // Declare a direct presenter for field
  presenter?: AnyComponent

  color?: Asset // Define a item color if appropriate
}

export function UX (label: IntlString, options: Partial<UXOptions> = {}): any {
  function uxProp (target: any, propertyKey: string): void {
    const classifier = getClass(target)

    const attr = loadClassifierChild(target, propertyKey)
    classifier.postProcessing.push((model, cl) => {
      if (attr) {
        model.mixinDocument(attr, ui.mixin.UXAttribute, {
          ...options,
          label,
          visible: true
        })
      }
    })
  }

  function uxClass<C extends { new (): Doc }> (constructor: C) {
    const classifier = getClass(constructor.prototype)
    classifier.postProcessing.push((model, cl) => {
      model.mixinDocument(cl, ui.mixin.UXObject, {
        icon: options.icon,
        label
      })
    })
  }

  return function (this: unknown, ...args: unknown[]): unknown {
    switch (args.length) {
      case 1:
        return uxClass.apply(this, args as [{ new (): Doc }])
      case 2:
      case 3:
        return uxProp.apply(this, args as [any, string])
      default:
        throw new Error('unsupported decorator')
    }
  }
}
