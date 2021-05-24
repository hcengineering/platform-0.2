<!--
Copyright © 2020, 2021 Anticrm Platform Contributors.

Licensed under the Eclipse Public License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may
obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and
limitations under the License.
-->
<script type="ts">
  import type { Participant } from '..'

  export let participant: Participant
  export let isLocal: boolean = false
  let videoContainer: HTMLVideoElement

  $: if (videoContainer) {
    videoContainer.srcObject = participant.media
  }
</script>

<video class="video" autoplay muted={isLocal} controls={false} bind:this={videoContainer} />

<style lang="scss">
  .video {
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 20px;
    border: 1px solid var(--theme-bg-accent-color);
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
