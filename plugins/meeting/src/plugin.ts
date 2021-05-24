// Copyright © 2020, 2021 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.

import { readable, writable } from 'svelte/store'

import { Platform } from '@anticrm/platform'
import { CoreService } from '@anticrm/platform-core'
import { RPC_CALL_WEBRTC } from '@anticrm/rpc'
import { ICECandidateMsg, MsgType, OutgoingMsg, Participant as RawParticipant, ParticipantJoinedMsg, ParticipantLeftMsg, JoinRespMsg, TransmitVideoRespMsg } from '@anticrm/webrtc'
import { EventType } from '@anticrm/client/src/common'

import MeetingView from './components/MeetingView.svelte'
import meeting, { MeetingService, Participant } from '.'

type Listener<T extends OutgoingMsg> = (msg: T) => Promise<void>
const webRTCPub = new class {
  private readonly listeners = new Map<MsgType, Array<Listener<any>>>()

  async onMsg (msg: OutgoingMsg): Promise<void> {
    await Promise.all(
      (this.listeners.get(msg.type) ?? [])
        .map(async l => await l(msg))
    )
  }

  sub <T extends OutgoingMsg>(t: T['type'], l: Listener<T>): () => void {
    const existing = this.listeners.get(t) ?? []
    existing.push(l)

    this.listeners.set(t, existing)

    return () =>
      this.listeners.set(t, (this.listeners.get(t) ?? []).filter(x => x !== l))
  }
}()

const leftPub = new class {
  private listeners: Array<() => void> = []

  onLeft (): void {
    this.listeners.forEach(l => l())
  }

  sub (l: () => void): () => void {
    this.listeners.push(l)

    return () => {
      this.listeners = this.listeners.filter(x => x !== l)
    }
  }
}()

export default async (platform: Platform, { core }: {core: CoreService}): Promise<MeetingService> => {
  platform.setResource(meeting.component.MeetingView, MeetingView)

  const { rpc } = core
  rpc.addEventListener(EventType.WebRTC, (event) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    webRTCPub.onMsg(event as never as OutgoingMsg)
  })

  const setupPeer = async (participant: Participant, remote = true): Promise<void> => {
    participant.peer.addEventListener('connectionstatechange', () => {
      console.log('connectionstate', participant.id, participant.peer.connectionState)
    })

    if (remote) {
      participant.peer.addTransceiver('audio', { direction: 'recvonly' })
      participant.peer.addTransceiver('video', { direction: 'recvonly' })
      participant.peer.addEventListener('track', (event) => {
        participant.media.addTrack(event.track)
      })
    } else {
      participant.media.getTracks()
        .forEach((track) => {
          participant.peer.addTrack(track)
        })
    }

    participant.peer.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate === null) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      rpc.request(RPC_CALL_WEBRTC, {
        type: MsgType.ICECandidate,
        participant: participant.internalID,
        candidate
      })
    })

    await participant.peer.createOffer()
      .then(async (offer) => {
        await participant.peer.setLocalDescription(offer)
        await rpc.request(RPC_CALL_WEBRTC, {
          type: MsgType.TransmitVideo,
          from: participant.internalID,
          sdp: offer.sdp
        })
      })
  }

  const makeParticipant = (raw: RawParticipant, isMediaReady = true): Participant => ({
    id: raw.id,
    internalID: raw.internalID,
    peer: new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] }
      ]
    }),
    media: new MediaStream(),
    isMediaReady
  })

  let hasLeft = true

  const participants = readable<Participant[]>([], set => {
    let actual: Participant[] = []
    const update = (updater: (val: Participant[]) => Participant[]): void => {
      actual = updater(actual)
      set(actual)
    }

    const unsubs: Array<() => void> = []

    const onLeft = (): void =>
      actual.forEach(p => {
        p.peer.close()
        p.media.getTracks().forEach((track) => {
          track.stop()
          p.media.removeTrack(track)
        })
      })

    unsubs.push(
      leftPub.sub(() => {
        onLeft()
        set([])
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.JoinResp, async (msg: JoinRespMsg) => {
        update(() => msg.participants.map(x => makeParticipant(x)))

        await Promise.all(actual.map(async x => await setupPeer(x)))
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.ParticipantJoined, async (msg: ParticipantJoinedMsg) => {
        const participant = makeParticipant(msg.participant)
        update((cur) => [...cur, participant])

        await setupPeer(participant)
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.TransmitVideoResp, async (msg: TransmitVideoRespMsg) => {
        const { from, sdp } = msg
        const target = actual.find(x => x.internalID === from)

        if (target === undefined) {
          return
        }

        await target.peer.setRemoteDescription({ type: 'answer', sdp })
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.ParticipantLeft, async (msg: ParticipantLeftMsg) => {
        const participant = actual.find(x => x.internalID === msg.participant.internalID)

        if (participant === undefined) {
          return
        }

        participant.peer.close()

        update((cur) => cur.filter(x => x.internalID !== msg.participant.internalID))
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.ICECandidate, async (msg: ICECandidateMsg) => {
        const { candidate, participant: internalID } = msg
        const participant = actual.find(x => x.internalID === internalID)

        if (participant === undefined) {
          return
        }

        await participant.peer.addIceCandidate(candidate)
      })
    )

    return () => {
      onLeft()
      set([])
      unsubs.forEach(unsub => unsub())
    }
  })

  const initMe = makeParticipant({
    id: '',
    internalID: ''
  }, false)

  const me = readable(initMe, set => {
    let actual = makeParticipant({
      id: '',
      internalID: ''
    }, false)
    const update = (updater: (val: Participant) => Participant): void => {
      actual = updater(actual)
      set(actual)
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 920 }
      }
    }).then(media => update(me => ({
      ...me,
      media,
      isMediaReady: true
    }))).catch((x) => console.error(x))

    const unsubs: Array<() => void> = []

    const onLeft = (): void => actual.peer.close()

    unsubs.push(
      leftPub.sub(onLeft)
    )

    unsubs.push(
      webRTCPub.sub(MsgType.JoinResp, async (msg: JoinRespMsg) => {
        if (hasLeft) {
          return
        }

        update((cur) => ({
          ...cur,
          ...msg.me,
          peer: new RTCPeerConnection({
            iceServers: [
              { urls: ['stun:stun.l.google.com:19302'] }
            ],
            iceTransportPolicy: 'all',
            iceCandidatePoolSize: 2
          })
        }))

        await setupPeer(actual, false)
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.TransmitVideoResp, async (msg: TransmitVideoRespMsg) => {
        const { from, sdp } = msg
        if (actual.internalID !== from) {
          return
        }

        await actual.peer.setRemoteDescription({ type: 'answer', sdp })
      })
    )

    unsubs.push(
      webRTCPub.sub(MsgType.ICECandidate, async (msg: ICECandidateMsg) => {
        const { candidate, participant: internalID } = msg
        if (actual.internalID !== internalID) {
          return
        }

        await actual.peer.addIceCandidate(candidate)
      })
    )

    return () => {
      onLeft()
      actual.media.getTracks()
        .forEach(track => {
          track.stop()
          actual.media.removeTrack(track)
        })
      unsubs.forEach(x => x())
    }
  })

  const isJoined = writable(false)

  return {
    join: async (room: string) => {
      const curHasLeft = hasLeft
      hasLeft = false
      isJoined.set(!hasLeft)

      if (curHasLeft) {
        const joinResp: JoinRespMsg = await rpc.request(RPC_CALL_WEBRTC, {
          type: MsgType.Join,
          room
        })

        await webRTCPub.onMsg(joinResp)
      }
    },
    leave: async () => {
      const curHasLeft = hasLeft
      hasLeft = true
      isJoined.set(!hasLeft)

      if (!curHasLeft) {
        await rpc.request(RPC_CALL_WEBRTC, {
          type: MsgType.Leave
        })
        leftPub.onLeft()
      }
    },
    room: {
      participants,
      user: me,
      isJoined
    }
  }
}
