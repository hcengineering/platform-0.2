import core, { Class, Collection, Doc, MODEL_DOMAIN, Ref } from '@anticrm/core'
import { TDoc, TEmb } from '@anticrm/core-model'
import domains, { Application, CollectionReference, Indices, ShortID, Space, SpaceUser, Title, TitleSource, TITLE_DOMAIN, VDoc } from '@anticrm/domains'
import { Builder, Class$, CollectionOf$, getClass, Mixin$, Prop, RefTo$ } from '@anticrm/model'
import { TReference } from './references'
import { TAddItemTx, TCreateTx, TDeleteTx, TItemTx, TObjectTx, TRemoveItemTx, TTx, TUpdateItemTx, TUpdateTx } from './tx'

export function Primary () {
  return function (target: any, propertyKey: string): void {
    const classifier = getClass(target)

    classifier.postProcessing.push((model, cl) => {
      model.mixinDocument(cl, domains.mixin.Indices, { primary: propertyKey })
    })
  }
}

@Class$(domains.class.SpaceUser, core.class.Emb, MODEL_DOMAIN)
export class TSpaceUser extends TEmb implements SpaceUser {
  @Prop() userId!: string
  @Prop() owner!: boolean
}

@Class$(domains.class.Space, core.class.Doc, MODEL_DOMAIN)
export class TSpace extends TDoc implements Space {
  @Primary()
  @Prop() name!: string

  @Prop() description!: string

  @RefTo$(domains.class.Application) application!: Ref<Application>

  @Prop() applicationSettings?: any

  @Prop() spaceKey!: string

  @CollectionOf$(domains.class.SpaceUser) users!: Collection<SpaceUser>

  @Prop(core.class.Boolean) isPublic!: boolean

  @Prop(core.class.Boolean) archived!: boolean
}

@Class$(domains.class.VDoc, core.class.Doc, MODEL_DOMAIN)
export class TVDoc extends TDoc implements VDoc {
  @RefTo$(domains.class.Space) _space!: Ref<Space>
  @Prop() _createdOn!: number
  @Prop() _createdBy!: string
  @Prop() _modifiedOn?: number
  @Prop() _modifiedBy?: string
}

@Mixin$(domains.mixin.ShortID, domains.class.VDoc)
export class TVShortID extends TVDoc implements ShortID {
  @Prop() shortId!: string
}
@Class$(domains.class.Application, core.class.Doc, MODEL_DOMAIN)
export class TApplication extends TDoc implements Application {
}

@Class$(domains.class.Title, core.class.Doc, TITLE_DOMAIN)
export class TTitle extends TDoc implements Title {
  @RefTo$(core.class.Class) _objectClass!: Ref<Class<Doc>>
  @RefTo$(core.class.Doc) _objectId!: Ref<Doc>
  @Prop() title!: string | number
  @Prop() source!: TitleSource
}

@Mixin$(domains.mixin.Indices, core.class.Doc)
export class TIndexesClass extends TDoc implements Indices {
  @Prop() primary!: string
}

///
@Mixin$(domains.mixin.CollectionReference, core.class.Emb)
export class TCollectionReference extends TEmb implements CollectionReference {
  @RefTo$(core.class.Doc) _parentId!: Ref<Doc>
  @RefTo$(core.class.Class) _parentClass!: Ref<Class<Doc>>
  @Prop() _collection!: string
  @RefTo$(domains.class.Space) _parentSpace!: Ref<Space>
}

export function model (S: Builder): void {
  S.add(TReference, TTitle)
  S.add(TTx, TCreateTx, TUpdateTx, TDeleteTx, TObjectTx, TAddItemTx, TUpdateItemTx, TRemoveItemTx, TItemTx)
  S.add(TIndexesClass, TCollectionReference, TVShortID, TVDoc)
  S.add(TSpace, TSpaceUser)
}
