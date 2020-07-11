<script lang="ts">
  import { defineComponent } from 'vue'
  import { getCoreService } from '../../int'
  import workbench from '../..'

  export default defineComponent({
    components: {},
    props: {},

    setup(props) {
      const coreService = getCoreService()
      const apps = coreService.getModel().find(workbench.class.Application, {})
      return {apps}
    }
  })
</script>

<template>
  <div>
  </div>
</template>
