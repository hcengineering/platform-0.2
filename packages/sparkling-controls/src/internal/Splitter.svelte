<script lang="ts">
  import { onDestroy } from 'svelte'

  export let prevDiv: HTMLElement
  export let nextDiv: HTMLElement
  export let minWidth = 150
  export let devMode = false
  export let horizontal = false

  let splitterDiv: HTMLElement
  let splitterIcon: HTMLElement
  let coverPrev: HTMLElement
  let coverNext: HTMLElement

  let prevRect: DOMRect
  let nextRect: DOMRect
  let startCoord: number

  let hoverMode = false
  const splitterStyle: string = horizontal
    ? 'width: 100%; height: 4px; min-height: 4px; cursor: row-resize;'
    : 'height: 100%; width: 4px; min-width: 4px; cursor: col-resize;'

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
  <div bind:this={splitterIcon} class="splitIcon" class:rotateSplit={horizontal} on:mousedown={onMouseDown} />
</div>

<style lang="scss">
  .splitter {
    position: relative;
    box-sizing: border-box;
    background-color: var(--theme-bg-accent-color);

    &:hover,
    &-statehover {
      background-color: var(--theme-bg-accent-hover);

      & > .splitIcon {
        visibility: visible;
        background-color: var(--theme-bg-accent-hover);
      }
    }
  }
  .splitIcon {
    visibility: hidden;
    position: absolute;
    user-select: none;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--theme-bg-accent-color);
    transform: translate(-50%, -50%);
    z-index: 1005;

    &.rotateSplit {
      transform-origin: center center;
      transform: translateY(-50%) rotate(90deg);
    }
  }
  .splitIcon::after,
  .splitIcon::before {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border: 4px solid transparent;
  }
  .splitIcon::after {
    border-left: 4px solid var(--theme-bg-dark-hover);
    transform: translate(12px, 6px);
  }
  .splitIcon::before {
    border-right: 4px solid var(--theme-bg-dark-hover);
    transform: translate(0px, 6px);
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
