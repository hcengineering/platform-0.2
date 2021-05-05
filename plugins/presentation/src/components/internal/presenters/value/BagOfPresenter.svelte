<script type="ts">
  import { BagOf, Class, CORE_CLASS_INSTANCE_OF, Emb, InstanceOf, Model, Obj, Ref } from '@anticrm/core'
  import { AnyComponent } from '@anticrm/platform-ui'
  import ui, { AttrModel, getCoreService } from '@anticrm/presentation'
  import Presenter from '../Presenter.svelte'

  export let value: Record<string, any>
  // export let editable = true // eslint-disable-line
  export let attribute: AttrModel

  const coreService = getCoreService()
  let model: Model
  let attributeClass: Ref<Class<Obj>> | undefined
  let presenter: AnyComponent | undefined
  let attrModel: AttrModel | undefined

  coreService.then((cs) => {
    model = cs.getModel()
  })
  $: if (model) {
    const bagAttrType = (attribute.type as BagOf).of
    if (bagAttrType !== undefined) {
      if (bagAttrType._class === CORE_CLASS_INSTANCE_OF) {
        attributeClass = (bagAttrType as InstanceOf<Emb>).of

        const typeClass = model.get(attributeClass) as Class<Obj>
        if (!model.isMixedIn(typeClass, ui.mixin.Presenter)) {
          console.log(new Error(`no presenter for type '${attributeClass}'`))
          // Use string presenter
        } else {
          presenter = model.as(typeClass, ui.mixin.Presenter).presenter
          attrModel = {
            _class: attributeClass,
            key: '',
            label: '',
            presenter,
            placeholder: '',
            primary: false,
            type: bagAttrType,
            icon: attribute.icon
          }
        }
      }
    }
  }
</script>

{#if model}
  <div class="bagof-container">
    {#if value}
      {#each Object.entries(value) as attr}
        <div class="attributes-container">
          <div class="title">{attr[0]}</div>
          <div>
            {#if presenter && attrModel}
              <Presenter is={presenter} attribute={attrModel} value={attr[1]} />
            {:else}
              {attr[1]}
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style lang="scss">
  .bagof-container {
    display: flex;
    flex-direction: column;
  }

  .attributes-container {
    display: flex;
    flex-direction: row;

    .title {
      margin-right: 5px;
    }
  }
</style>
