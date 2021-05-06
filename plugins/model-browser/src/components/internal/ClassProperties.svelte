<script type="ts">
  import { Class, CORE_CLASS_CLASS, Doc, Model, Ref } from '@anticrm/core'
  import { ClassModel, getCoreService, getPresentationService, PresentationService } from '@anticrm/presentation'
  import Properties from '@anticrm/presentation/src/components/internal/Properties.svelte'
  import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'

  export let object: Class<Doc>
  let objectId: Ref<Class<Doc>>

  const coreService = getCoreService()
  let model: Model

  coreService.then(async (cs) => {
    model = cs.getModel()
  })
  let classModel: ClassModel
  let presentationService: PresentationService

  getPresentationService().then((ps) => {
    presentationService = ps
    presentationService.getClassModel(CORE_CLASS_CLASS as Ref<Class<Doc>>).then((cm) => {
      classModel = cm
    })
  })

  $: objectId = object._id as Ref<Class<Doc>>
</script>

{#if model}
  <div class="classContent">
    <div id="create_task__input__name" class="caption caption-1">
      Class:
      <InlineEdit bind:value={object._id} placeholder="Name" />
    </div>
  </div>

  {#if classModel}
    <Properties model={classModel} bind:object />
  {/if}
{/if}

<style lang="scss">
  .classContent {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .description {
      overflow-y: auto;
    }
  }
</style>
