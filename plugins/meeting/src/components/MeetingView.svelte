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
  import { onDestroy } from 'svelte'
  import type { Readable } from 'svelte/store'

  import type { Space } from '@anticrm/domains'

  import Button from '@anticrm/sparkling-controls/src/Button.svelte'

  import ParticipantStream from './ParticipantStream.svelte'

  import { getMeetingService, MeetingService, Participant } from '..'

  export let space: Space

  const meetingServiceP = getMeetingService()
  let meetingService: MeetingService

  let user: Readable<Participant>
  let participants: Readable<Participant[]>
  let isJoined: Readable<boolean>

  async function init () {
    meetingService = await meetingServiceP
    user = meetingService.room.user
    participants = meetingService.room.participants
    isJoined = meetingService.room.isJoined
  }

  async function join () {
    const svc = await meetingServiceP
    svc.join(space._id)
  }

  function leave () {
    meetingService?.leave()
  }

  onDestroy(leave)

  let prevSpaceID = space?._id
  $: if (prevSpaceID !== space?._id) {
    meetingService?.leave()
    prevSpaceID = space?._id
  }

  let isMuted = false
  function toggleMute () {
    isMuted = !isMuted
    $user.media.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted
    })
  }
</script>

{#await init() then _}
  <div class="root">
    <div class="videos">
      <div class="video">
        <ParticipantStream participant={$user} isLocal={true} />
      </div>
      {#each $participants as participant (participant.internalID)}
        <div class="video">
          <ParticipantStream {participant} />
        </div>
      {/each}
    </div>
    <div class="controls">
      {#if !$isJoined}
        {#if $user.isMediaReady}
          <Button on:click={join} label="Join" />
        {/if}
      {:else}
        <Button on:click={leave} label="Leave" />
      {/if}
      <Button on:click={toggleMute} label={isMuted ? 'Unmute' : 'Mute'} />
    </div>
  </div>
{/await}

<style lang="scss">
  .root {
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0px 20px;
  }

  .controls {
    position: absolute;
    bottom: 25px;
    left: 0;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    gap: 10px;
  }

  .videos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 20px;
    width: 100%;
  }

  .video {
    min-height: 150px;
    min-width: 300px;
    position: relative;
    width: 100%;
    padding-top: 75%;
  }
</style>
