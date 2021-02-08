<script lang="ts">
  export const type: number = 0
  export const text: string = ''
  export const color: string = ''
  export const style: string = ''

  const status = [{
    text: 'К исполнению',
    color: 'var(--status-blue-color)'
  },
    {
      text: 'В работе',
      color: 'var(--status-green-color)'
    },
    {
      text: 'Сделано',
      color: 'var(--status-grey-color)'
    },
    {
      text: 'Просрочено',
      color: 'var(--status-maroon-color)'
    }]
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
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 11px;
    font-weight: 500;
    padding: 0px 4px;
    background-color: var(--status-green-color);
    border-radius: 2px;
    color: var(--white-color);
  }
</style>
