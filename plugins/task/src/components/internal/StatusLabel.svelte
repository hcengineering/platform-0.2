<script lang="ts">
  export const type: number = 0
  export const text: string = ''
  export const color: string = ''
  export const style: string = ''

  const status: Array = [{ text: 'К исполнению', color: 'var(--status-blue-color)'},
                         { text: 'В работе', color: 'var(--status-green-color)'},
                         { text: 'Сделано', color: 'var(--status-grey-color)'},
                         { text: 'Просрочено', color: 'var(--status-maroon-color)'}]
  let textOut: string = ''
  let colorOut: string = 'var(--status-grey-color)'
  if ((type >= 0) && (type <= status.length - 1)) {
    textOut = status[type].text
    colorOut = status[type].color
  }
  if (text !== '') textOut = text
  if (color !== '') colorOut = color

</script>

<div class="status" style="background-color: {colorOut}; {style}">{textOut}</div>

<style lang="scss">
  .status {
    font-size: 11px;
    line-height: 16px;
    font-weight: 500;
    text-align: center;
    padding: 2px 4px 0px 4px;
    background-color: var(--status-green-color);
    border-radius: 2px;
    color: var(--white-color);
  }
</style>