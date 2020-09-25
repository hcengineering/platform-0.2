<script type="ts">
  import PageBlock from './PageBlock.svelte'

  import Toolbar from '@anticrm/sparkling-controls/src/toolbar/Toolbar.svelte'
  import ToolbarButton from '@anticrm/sparkling-controls/src/toolbar/Button.svelte'

  let clickCount = 0
  function handler() {
    clickCount += 1
  }
</script>

<h1>Toolbar/Button</h1>

<h2>Toolbar</h2>

<span>Control to show buttons with horizontal alignment. accept any item and
  show inside
</span>

<h2>Toolbar/Button</h2>

<p>Individual button inside toolbar</p>

<span>Properties:</span>
<ul>
  <li>
    disabled (default false) - mark button as disabled, no clicks are allowed
  </li>
  <li>
    selected (default false) - mark button as selected, it will had alternative
    visual style
  </li>
  <li>style (default '') - override individual button style values</li>
</ul>

<h2>Examples</h2>

<PageBlock
  label="Simple toolbar"
  text="Toolbar is control with small selectable buttons"
  code="{`<Toolbar>
  <ToolbarButton on:click={handler}>
    Button1
  </ToolbarButton>
  <ToolbarButton on:click={handler}>
    Button2
  </ToolbarButton>
</Toolbar>`}"
>
  <div class="preview-pane">
    <Toolbar>
      <ToolbarButton on:click="{handler}">Button1</ToolbarButton>
      <ToolbarButton on:click="{handler}">Button2</ToolbarButton>
    </Toolbar>
  </div>
  Click count: {clickCount}
</PageBlock>

<PageBlock
  label="Button styles"
  text="Different button styles could be used"
  code="{`<Toolbar>
  <ToolbarButton
    selected on:click={handler}>
      Selected
  </ToolbarButton>
  <ToolbarButton
    disabled on:click={handler}>
      Disabled
  </ToolbarButton>
  <ToolbarButton
    on:click={handler}>
      Other button
  </ToolbarButton>
  <ToolbarButton
    on:click={handler}>
      Other button2
  </ToolbarButton>
</Toolbar>`}"
>
  <div class="preview-pane">
    <Toolbar>
      <ToolbarButton selected on:click="{handler}">Selected</ToolbarButton>
      <ToolbarButton disabled on:click="{handler}">Disabled</ToolbarButton>
      <ToolbarButton on:click="{handler}">Other button</ToolbarButton>
      <ToolbarButton on:click="{handler}">Other button2</ToolbarButton>
    </Toolbar>
  </div>
  <div>Click count: {clickCount}</div>
</PageBlock>

<PageBlock
  label="Toolbar with right bar"
  text="Toolbar is control with small selectable buttons"
  code="{`<Toolbar>
  <ToolbarButton on:click={handler}>
    Left BTN
  </ToolbarButton>
  <div slot="right">
    <ToolbarButton on:click={handler}>
      Right button1
    </ToolbarButton>
    <ToolbarButton on:click={handler}>
      Right button2
    </ToolbarButton>
  </div>
</Toolbar>`}"
>
  <div class="preview-pane">
    <Toolbar>
      <ToolbarButton on:click="{handler}">Left BTN</ToolbarButton>
      <div slot="right">
        <ToolbarButton on:click="{handler}">Right button1</ToolbarButton>
        <ToolbarButton on:click="{handler}">Right button2</ToolbarButton>
      </div>
    </Toolbar>
  </div>
  Click count: {clickCount}
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
