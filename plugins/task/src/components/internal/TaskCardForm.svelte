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
  .card-view {
    max-width: 300px;
    margin: 12px;
    background-color: var(--theme-bg-color);
    border: 1px solid var(--theme-bg-color);
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
        color: var(--theme-doclink-color);
      }
    }

    .card-body {
      margin-top: 8px;
    }
  }
</style>
