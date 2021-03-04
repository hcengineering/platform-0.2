<script lang='ts'>
  import { onDestroy } from 'svelte'

  export let prevDiv: HTMLElement
  export let nextDiv: HTMLElement
  export let minWidth: Number = 150
  export let devMode: boolean = false

  let splitterDiv: HTMLElement
  let splitterIcon: HTMLElement
  let coverPrev: HTMLElement
  let coverNext: HTMLElement

  let prevRect: DOMRect
  let nextRect: DOMRect
  let startX: Number

  let hoverMode: boolean = false

  function onMouseMove(event: MouseEvent): void {
    let dX: Number = event.clientX - startX
    if (dX < 0) {
      if (prevRect.width - Math.abs(dX) >= minWidth) {
        prevDiv.style.width = prevRect.width - Math.abs(dX) + 'px'
        nextDiv.style.width = nextRect.width + Math.abs(dX) + 'px'
      }
    } else {
      if (nextRect.width - dX >= minWidth) {
        prevDiv.style.width = prevRect.width + dX + 'px'
        nextDiv.style.width = nextRect.width - dX + 'px'
      }
    }
    setCoverSize(coverPrev, prevDiv)
    setCoverSize(coverNext, nextDiv)
  }

  function onMouseUp(event: MouseEvent): void {
    coverPrev.style.visibility = coverNext.style.visibility = 'hidden'
    prevDiv.style.userSelect = nextDiv.style.userSelect = 'auto'
    hoverMode = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onMouseDown(event : MouseEvent): void {
    prevRect = prevDiv.getBoundingClientRect()
    nextRect = nextDiv.getBoundingClientRect()
    startX = event.clientX
    hoverMode = true

    setCoverSize(coverPrev, prevDiv)
    setCoverSize(coverNext, nextDiv)
    coverPrev.style.visibility = coverNext.style.visibility = 'visible'
    prevDiv.style.userSelect = nextDiv.style.userSelect = 'none'

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function setCoverSize(elCover: HTMLElement, elSource: HTMLElement): void {
    let rect = elSource.getBoundingClientRect()

    elCover.style.top = rect.top + 'px'
    elCover.style.left = rect.left + 'px'
    elCover.style.width = rect.width + 'px'
    elCover.style.height = rect.height + 'px'
  }

  onDestroy(() => {
    prevDiv.style = ''
    nextDiv.style = ''
	})
</script>

<div bind:this={coverPrev} class="cover" class:coverDev={devMode}></div>
<div bind:this={coverNext} class="cover" class:coverDev={devMode} style="background-color: #ff0"></div>
<div bind:this={splitterDiv} class="splitter" class:splitter-statehover={hoverMode} on:mousedown={onMouseDown}>
  <div bind:this={splitterIcon} class="splitIcon" on:mousedown={onMouseDown}></div>
</div>

<style lang='scss'>
  .splitter {
    position: relative;
    box-sizing: border-box;
    width: 4px;
    min-width: 4px;
    height: 100%;
    background-color: var(--theme-bg-accent-color);
    cursor: col-resize;

    &:hover, &-statehover {
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
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--theme-bg-accent-color);
    transform: translate(calc(-50% + 2px), -50%);
    z-index: 1005;
  }
  .splitIcon::after, .splitIcon::before {
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
    opacity: .5;
  }
</style>