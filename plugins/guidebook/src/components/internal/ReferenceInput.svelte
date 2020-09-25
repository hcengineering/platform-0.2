<script type="ts">
  import PageBlock from './PageBlock.svelte'

  import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.svelte'
  import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.svelte'

  import ReferenceInput from '@anticrm/presentation/src/components/refinput/ReferenceInput.svelte'

  let message: string = ''

  function add(event: string) {
    message += event
  }
</script>

<h1>Reference Input</h1>

<p>
  Control to allow styled text input with support of references to platform
  objects.
</p>

<span>Properties:</span>
<ul>
  <li>stylesEnabled (default false) - Enable style editing by default</li>
  <li>on:message - allow to handle messages on enter</li>
</ul>

<h2>Examples</h2>

<PageBlock
  label="Default input"
  text="Reference input control could be used to accept comments"
  code="{`<ReferenceInput
    on:message={handler}/>`}"
>
  <div class="preview-pane">
    <ReferenceInput on:message="{(e) => add(e.detail)}" />
  </div>
  <div>
    {@html message}
  </div>
</PageBlock>

<PageBlock
  label="Input with styles"
  text="Reference input control could be used to accept comments"
  code="{`<ReferenceInput
    on:message={handler}
    stylesEnabled=true/>`}"
>
  <div class="preview-pane">
    <ReferenceInput on:message="{(e) => add(e.detail)}" stylesEnabled="true" />
  </div>
  <div>
    {@html message}
  </div>
</PageBlock>

<style lang="scss">
  .toolbar_table {
    width: 100%;
    border: 1px solid white;
  }
  .preview-pane {
    margin: 10px;
    background-color: hsl(210, 25%, 40%);
  }
</style>
