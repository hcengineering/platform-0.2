<script lang="ts">
  import Icon from '../../../../platform-ui/src/components/Icon.svelte'
  import type { Task } from '../../index'
  import taskIds from '../../index'
  import { CORE_MIXIN_SHORTID } from '@anticrm/domains'
  import { getCoreService } from '@anticrm/presentation'
  import { Model } from '@anticrm/core'

  export let doc: Task

  let model: Model
  getCoreService().then((cs) => {
    model = cs.getModel()
  })

  function getCaption (task: Task): string {
    return model.as(task, CORE_MIXIN_SHORTID).shortId + ' - ' + task.title
  }

  function getDescription (task: Task): string {
    if (task.comments && task.comments.length > 0) {
      return task.comments[0].message
    }
    return ''
  }
</script>

{#if model}
  <div class="card-view">
    <div class="card-head">
      <Icon icon={taskIds.icon.Task} />
      <div class="card-head__caption">{getCaption(doc)}</div>
    </div>
    <div class="card-body">{getDescription(doc)}</div>
  </div>
{/if}

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
