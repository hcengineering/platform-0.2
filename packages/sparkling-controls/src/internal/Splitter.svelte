<script lang="ts">
  import { onDestroy } from 'svelte'

  export let prevDiv: HTMLElement
  export let nextDiv: HTMLElement
  export let size = 4
  export let spacing = 4
  export let margin = 20
  export let minWidth = 150
  export let devMode = false
  export let horizontal = false

  let splitterDiv: HTMLElement
  let coverPrev: HTMLElement
  let coverNext: HTMLElement

  let prevRect: DOMRect
  let nextRect: DOMRect
  let startCoord: number

  let hoverMode = false
  const splitterStyle: string = horizontal
    ? `margin: ${spacing}px ${margin}px; width: calc(100% - ${margin * 2}px); height: ${size}px; min-height: ${size}px; cursor: row-resize;`
    : `margin: ${margin}px ${spacing}px; height: calc(100% - ${margin * 2}px); width: ${size}px; min-width: ${size}px; cursor: col-resize;`

  function onMouseMove (event: MouseEvent): void {
    let dCoord: number
    if (horizontal) {
      dCoord = event.clientY - startCoord
      if (dCoord < 0) {
        if (prevRect.height - Math.abs(dCoord) >= minWidth) {
          prevDiv.style.height = `${prevRect.height - Math.abs(dCoord)}px`
          nextDiv.style.height = `${nextRect.height + Math.abs(dCoord)}px`
        }
      } else {
        if (nextRect.height - dCoord >= minWidth) {
          prevDiv.style.height = `${prevRect.height + dCoord}px`
          nextDiv.style.height = `${nextRect.height - dCoord}px`
        }
      }
    } else {
      dCoord = event.clientX - startCoord
      if (dCoord < 0) {
        if (prevRect.width - Math.abs(dCoord) >= minWidth) {
          prevDiv.style.width = `${prevRect.width - Math.abs(dCoord)}px`
          nextDiv.style.width = `${nextRect.width + Math.abs(dCoord)}px`
        }
      } else {
        if (nextRect.width - dCoord >= minWidth) {
          prevDiv.style.width = `${prevRect.width + dCoord}px`
          nextDiv.style.width = `${nextRect.width - dCoord}px`
        }
      }
    }
    setCoverSize(coverPrev, prevDiv)
    setCoverSize(coverNext, nextDiv)
  }

  function onMouseUp (event: MouseEvent): void {
    coverPrev.style.visibility = coverNext.style.visibility = 'hidden'
    prevDiv.style.userSelect = nextDiv.style.userSelect = 'auto'
    hoverMode = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onMouseDown (event: MouseEvent): void {
    prevRect = prevDiv.getBoundingClientRect()
    nextRect = nextDiv.getBoundingClientRect()
    if (horizontal) startCoord = event.clientY
    else startCoord = event.clientX
    hoverMode = true

    setCoverSize(coverPrev, prevDiv)
    setCoverSize(coverNext, nextDiv)
    coverPrev.style.visibility = coverNext.style.visibility = 'visible'
    prevDiv.style.userSelect = nextDiv.style.userSelect = 'none'

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function setCoverSize (elCover: HTMLElement, elSource: HTMLElement): void {
    const rect = elSource.getBoundingClientRect()

    elCover.style.top = `${rect.top}px`
    elCover.style.left = `${rect.left}px`
    elCover.style.width = `${rect.width}px`
    elCover.style.height = `${rect.height}px`
  }

  onDestroy(() => {
    prevDiv.style = ''
    nextDiv.style = ''
  })
</script>

<div bind:this={coverPrev} class="cover" class:coverDev={devMode} />
<div bind:this={coverNext} class="cover" class:coverDev={devMode} style="background-color: #ff0" />
<div
  bind:this={splitterDiv}
  class="splitter"
  class:splitter-statehover={hoverMode}
  style={splitterStyle}
  on:mousedown={onMouseDown}>
</div>

<style lang="scss">
  @import "~@anticrm/sparkling-theme/styles/_global.scss";

  .splitter {
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    background-color: transparent;
  }
  :global(.theme-dark) .splitter {
    &:hover, &-statehover {
      background-color: $theme-dark-bg-accent-color;
    }
  }
  :global(.theme-grey) .splitter {
    &:hover, &-statehover {
      background-color: $theme-grey-bg-accent-color;
    }
  }
  :global(.theme-light) .splitter {
    &:hover, &-statehover {
      background-color: $theme-light-bg-accent-color;
    }
  }

  .cover {
    visibility: hidden;
    position: fixed;
    background-color: #fff;
    opacity: 0;
    z-index: 1000;
  }
  .coverDev {
    opacity: 0.5;
  }
</style>
