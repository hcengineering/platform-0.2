<script lang="ts">
  import { CORE_MIXIN_SHORTID, VDoc } from '@anticrm/domains'
  import presentation, { getCoreService } from '@anticrm/presentation'
  import { Class, CORE_CLASS_STRING, Model, Obj } from '@anticrm/core'
  import { Asset } from '@anticrm/platform-ui'
  import Icon from '../../../../../platform-ui/src/components/Icon.svelte'

  export let doc: VDoc
  let icon: Asset | undefined = undefined
  let model: Model
  let title: string | undefined = undefined

  const init = getCoreService().then((cs) => {
    model = cs.getModel()
    let cl = model.get(doc._class) as Class<Obj>
    while (cl && !title) {
      model.asMixin(cl, presentation.mixin.UXObject, (ux) => {
        icon = ux.icon
        title = ux.label
      })
      if (cl._extends) {
        cl = model.get<Class<Obj>>(cl._extends)
      } else {
        return
      }
    }
  })

  function getCaption (model: Model, doc: VDoc): string {
    let result = ''
    model.asMixin(doc, CORE_MIXIN_SHORTID, (m) => {
      result = m.shortId + ' - '
    })
    const primary = model.getPrimaryKey(doc._class)
    if (primary) {
      result += (doc as any)[primary]
    }
    return result
  }

  function getDescription (model: Model, doc: VDoc): string[] {
    const result = []
    model
      .getAllAttributes(doc._class)
      .filter((m) => m.attr.type._class === CORE_CLASS_STRING)
      .forEach((s) => {
        const val = (doc as any)[s]
        if (val) {
          result.push(val)
        }
      })
    return result
  }

  let description: string[]
  $: if (model) description = getDescription(model, doc)
</script>

{#await init then ct}
  <div class="card-view">
    <div class="card-head">
      <Icon {icon} />
      {#if title}
        <h5>{title}</h5>
      {/if}
      <div class="card-head__caption">{getCaption(model, doc)}</div>
    </div>
    {#if description.length > 0}
      <div class="card-body">
        {#each description as d}
          <span>{d}</span>
        {/each}
      </div>
    {/if}
  </div>
{/await}

<style lang="scss">
  @import '~@anticrm/sparkling-theme/styles/_global.scss';

  .card-view {
    max-width: 300px;
    margin: 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.3s ease-in, box-shadow 0.3s ease-in;

    .card-head {
      display: flex;
      flex-direction: row;
      align-items: center;
      &__avatar {
        width: 32px;
        height: 32px;
        border-radius: 16px;
      }
      &__caption {
        padding-left: 8px;
      }
    }

    .card-body {
      margin-top: 8px;
    }
  }
  :global(.theme-dark) .card-view {
    background-color: $theme-dark-bg-color;
    border: 1px solid $theme-dark-bg-color;
    .card-head__caption {
      color: $theme-dark-doclink-color;
    }
  }
  :global(.theme-grey) .card-view {
    background-color: $theme-grey-bg-color;
    border: 1px solid $theme-grey-bg-color;
    .card-head__caption {
      color: $theme-grey-doclink-color;
    }
  }
  :global(.theme-light) .card-view {
    background-color: $theme-light-bg-color;
    border: 1px solid $theme-light-bg-color;
    .card-head__caption {
      color: $theme-light-doclink-color;
    }
  }
</style>
