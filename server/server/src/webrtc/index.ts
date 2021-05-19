import KurentoClient, { MediaPipeline } from 'kurento-client'
import PQueue from 'p-queue'

import { IncomingMsg, MsgType, Participant } from '@anticrm/webrtc'

import { Client } from '../server'
import { getUserSpaces } from '../spaces'
import { WorkspaceProtocol } from '../workspace'
import { Session } from './session'

interface Room {
  pipeline: MediaPipeline
  participants: Set<Participant>
}
export default class {
  private nextID = 0
  private readonly kurento = KurentoClient('ws://359.rocks:8888/kurento')

  private readonly rooms: Map<string, {
    pipeline: MediaPipeline
    participants: Set<Participant>
  }> = new Map()

  private readonly clients: Map<string, Session> = new Map()
  private readonly joinLeaveQueue = new PQueue({ concurrency: 1 })

  private async join (participant: Participant, roomID: string, send: (msg: any) => void): Promise<Room> {
    const room = this.rooms.get(roomID) ?? {
      pipeline: await this.kurento.then(async (c) => await c.create('MediaPipeline')),
      participants: new Set()
    }

    this.rooms.set(roomID, room)

    const session = new Session(participant.internalID, room.pipeline, send)

    this.clients.set(participant.internalID, session)

    const participants = [...room.participants]

    participants
      .map(x => this.clients.get(x.internalID))
      .filter((x): x is Session => x !== undefined)
      .forEach(x => x.send({
        type: MsgType.ParticipantJoined,
        participant
      }))

    room.participants.add(participant)

    return room
  }

  private async leave (participant: Participant): Promise<void> {
    const session = this.clients.get(participant.internalID)
    if (session === undefined) {
      return
    }

    await session.close()
    this.clients.delete(participant.internalID)

    const roomEntry = [...this.rooms.entries()].find(([, x]) => x.participants.has(participant))
    if (roomEntry === undefined) {
      return
    }

    const [roomID, room] = roomEntry

    room.participants.delete(participant)
    const participants = [...room.participants]

    participants
      .map(x => this.clients.get(x.internalID))
      .filter((x): x is Session => x !== undefined)
      .forEach(x => {
        x.send({
          type: MsgType.ParticipantLeft,
          participant
        })

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        x.cancelVideoTransmission(participant.internalID)
      })

    if (participants.length === 0) {
      this.rooms.delete(roomID)
      await room.pipeline.release()
    }
  }

  private getID (): string {
    return `${this.nextID++}`
  }

  onNewClient (
    client: Client,
    send: (msg: any) => void,
    workspaceP: Promise<WorkspaceProtocol>
  ): {
      onWSMsg: (msg: IncomingMsg) => Promise<void>
      onClose: () => Promise<void>
    } {
    const participant = {
      internalID: this.getID(),
      id: client.email
    }

    return {
      onWSMsg: async (msg: IncomingMsg): Promise<any> => {
        const workspace = await workspaceP
        const session = this.clients.get(participant.internalID)

        if (msg.type === MsgType.Join) {
          if (session !== undefined) {
            throw Error(`Already joined to the room: ${msg.room}`)
          }

          const userSpaces = await getUserSpaces(workspace, client.email)

          if (!userSpaces.has(msg.room)) {
            throw Error('Permission denied')
          }

          const roomID = `${client.workspace}-${msg.room}`

          const room = await this.joinLeaveQueue
            .add(async () => await this.join(participant, roomID, send))

          return {
            type: MsgType.JoinResp,
            participants: [...room.participants]
              .filter(x => x.internalID !== participant.internalID),
            me: participant
          }
        }

        if (session === undefined) {
          throw Error('User session does not exist')
        }

        if (msg.type === MsgType.ICECandidate) {
          await session.addICECandidate(msg.candidate, msg.participant)
          return 'OK'
        }

        if (msg.type === MsgType.TransmitVideo) {
          const targetSession = this.clients.get(msg.from)

          if (targetSession === undefined) {
            throw Error('Missing participant')
          }

          await session.initVideoTransmission(targetSession, msg.sdp)
          return 'OK'
        }

        if (msg.type === MsgType.Leave) {
          await this.joinLeaveQueue
            .add(async () => await this.leave(participant))

          return 'OK'
        }
      },
      onClose: async (): Promise<void> => {
        await this.joinLeaveQueue
          .add(async () => await this.leave(participant))
      }
    }
  }
}
