import KurentoClient, { MediaPipeline } from 'kurento-client'
import PQueue from 'p-queue'

import { IncomingMsg, MsgType, Participant, ScreenSharingFinishedMsg, ScreenSharingStartedMsg } from '@anticrm/webrtc'

import { Client } from '../server'
import { getUserSpaces } from '../spaces'
import { WorkspaceProtocol } from '../workspace'
import { Session } from './session'

const isDefined = <T> (x: T | undefined | null): x is T => x !== undefined && x !== null

interface Room {
  pipeline: MediaPipeline
  participants: Set<Participant>
  screenSession?: Session
}
export default class {
  private nextID = 0
  private readonly kurento = KurentoClient('ws://359.rocks:8888/kurento')

  private readonly rooms: Map<string, Room> = new Map()

  private readonly clients: Map<string, {session: Session, roomID: string}> = new Map()
  private readonly actionQueue = new PQueue({ concurrency: 1 })

  private readonly forEachSession = (fn: (s: Session) => void, participants: Participant[]): void =>
    participants
      .map(x => this.clients.get(x.internalID))
      .filter(isDefined)
      .map(x => x.session)
      .forEach(fn)

  private async join (participant: Participant, roomID: string, send: (msg: any) => void): Promise<Room> {
    const room = this.rooms.get(roomID) ?? {
      pipeline: await this.kurento.then(async (c) => await c.create('MediaPipeline')),
      participants: new Set()
    }

    this.rooms.set(roomID, room)

    const session = new Session(participant.internalID, room.pipeline, send)

    this.clients.set(participant.internalID, { session, roomID })

    this.forEachSession(
      (s) => s.send({
        type: MsgType.ParticipantJoined,
        participant
      }),
      [...room.participants]
    )

    room.participants.add(participant)

    return room
  }

  private async initScreenSharing (participant: Participant, send: (msg: any) => void): Promise<ScreenSharingStartedMsg> {
    const roomID = this.clients.get(participant.internalID)?.roomID ?? ''
    const room = this.rooms.get(roomID)

    if (room === undefined) {
      throw Error('Room is not found')
    }

    if (room.screenSession !== undefined) {
      throw Error('Screen session is already launched')
    }

    const session = new Session(participant.internalID + '-screen', room.pipeline, send)

    room.screenSession = session

    this.forEachSession(
      (s) => s.send({
        type: MsgType.ScreenSharingStarted,
        owner: participant.internalID
      }),
      [...room.participants]
        .filter(x => x.internalID !== participant.internalID)
    )

    return {
      type: MsgType.ScreenSharingStarted,
      owner: participant.internalID
    }
  }

  private async stopScreenSharing (participant: Participant): Promise<ScreenSharingFinishedMsg> {
    const roomID = this.clients.get(participant.internalID)?.roomID ?? ''
    const room = this.rooms.get(roomID)

    if (room === undefined) {
      throw Error('Room is not found')
    }

    if (room.screenSession === undefined) {
      throw Error('Screen session does not exist')
    }

    if (room.screenSession.name.slice(0, -7) !== participant.internalID) {
      throw Error('Permission denied')
    }

    await room.screenSession.close()

    this.forEachSession(
      (s) => {
        room.screenSession !== undefined && s.cancelVideoTransmission(room.screenSession.name)
        s.send({
          type: MsgType.ScreenSharingFinished
        })
      },
      [...room.participants]
        .filter(x => x.internalID !== participant.internalID)
    )

    room.screenSession = undefined

    return {
      type: MsgType.ScreenSharingFinished
    }
  }

  private async leave (participant: Participant): Promise<void> {
    const client = this.clients.get(participant.internalID)
    if (client === undefined) {
      return
    }

    const roomEntry = [...this.rooms.entries()].find(([, x]) => x.participants.has(participant))
    if (roomEntry === undefined) {
      return
    }

    const [roomID, room] = roomEntry

    if (room.screenSession?.name.slice(0, -7) === participant.internalID) {
      await this.stopScreenSharing(participant)
    }

    await client.session.close()
    this.clients.delete(participant.internalID)

    room.participants.delete(participant)

    if (room.participants.size === 0) {
      this.rooms.delete(roomID)
      await room.pipeline.release()

      return
    }

    this.forEachSession(
      (s) => {
        s.send({
          type: MsgType.ParticipantLeft,
          participant
        })

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        s.cancelVideoTransmission(participant.internalID)
      },
      [...room.participants]
    )
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
        const session = this.clients.get(participant.internalID)?.session

        if (msg.type === MsgType.Join) {
          if (session !== undefined) {
            throw Error(`Already joined to the room: ${msg.room}`)
          }

          const userSpaces = await getUserSpaces(workspace, client.email)

          if (!userSpaces.has(msg.room)) {
            throw Error('Permission denied')
          }

          const roomID = `${client.workspace}-${msg.room}`

          const room = await this.actionQueue
            .add(async () => await this.join(participant, roomID, send))

          return {
            type: MsgType.JoinResp,
            participants: [...room.participants]
              .filter(x => x.internalID !== participant.internalID),
            me: participant,
            screen: room.screenSession?.name
          }
        }

        if (session === undefined) {
          throw Error('User session does not exist')
        }

        if (msg.type === MsgType.InitScreenSharing) {
          return await this.actionQueue
            .add(async () => await this.initScreenSharing(participant, send))
        }

        if (msg.type === MsgType.StopScreenSharing) {
          return await this.actionQueue
            .add(async () => await this.stopScreenSharing(participant))
        }

        if (msg.type === MsgType.ICECandidate) {
          const isScreenOwner = participant.internalID + '-screen' === msg.participant

          if (isScreenOwner) {
            const screenSession = this.rooms.get(this.clients.get(participant.internalID)?.roomID ?? '')?.screenSession

            if (screenSession === undefined) {
              throw Error('Screen session is missing')
            }

            await screenSession.addICECandidate(msg.candidate, msg.participant)
          } else {
            await session.addICECandidate(msg.candidate, msg.participant)
          }
          return 'OK'
        }

        if (msg.type === MsgType.TransmitVideo) {
          const isScreen = msg.from.endsWith('screen')
          const actualID = isScreen
            ? msg.from.slice(0, -7)
            : msg.from

          const targetClient = this.clients.get(actualID)

          if (targetClient === undefined) {
            throw Error('Missing participant')
          }

          const targetSession = isScreen
            ? this.rooms.get(targetClient.roomID ?? '')?.screenSession
            : targetClient.session

          if (targetSession === undefined) {
            throw Error('Missing session')
          }

          const srcSession = `${participant.internalID}-screen` === msg.from
            ? targetSession
            : session

          await srcSession.initVideoTransmission(targetSession, msg.sdp)
          return 'OK'
        }

        if (msg.type === MsgType.Leave) {
          await this.actionQueue
            .add(async () => await this.leave(participant))

          return 'OK'
        }
      },
      onClose: async (): Promise<void> => {
        await this.actionQueue
          .add(async () => await this.leave(participant))
      }
    }
  }
}
