import { IceCandidate } from 'kurento-client'

export const enum MsgType {
  Join = 'join',
  Leave = 'leave',
  ParticipantJoined = 'participant-joined',
  ParticipantLeft = 'participant-left',
  JoinResp = 'join-resp',
  ICECandidate = 'ice-candidate',
  TransmitVideo = 'transmit-video',
  TransmitVideoResp = 'transmit-video-resp',
  CancelVideoTransmission = 'cancel-video-transmission',
  InitScreenSharing = 'init-screen-sharing',
  StopScreenSharing = 'stop-screen-sharing',
  ScreenSharingStarted = 'screen-sharing-started',
  ScreenSharingFinished = 'screen-sharing-finished',
}

type InternalID = string
export interface Participant {
  internalID: InternalID
  id: string
}

export interface JoinMsg {
  type: MsgType.Join
  room: string
}

export interface LeaveMsg {
  type: MsgType.Leave
}

export interface ParticipantJoinedMsg {
  type: MsgType.ParticipantJoined
  participant: Participant
}

export interface ParticipantLeftMsg {
  type: MsgType.ParticipantLeft
  participant: Participant
}

export interface JoinRespMsg {
  type: MsgType.JoinResp
  participants: Participant[]
  me: Participant
  screen?: InternalID
}

export interface TransmitVideoMsg {
  type: MsgType.TransmitVideo
  from: InternalID
  sdp: string
  screen?: boolean
}

export interface TransmitVideoRespMsg {
  type: MsgType.TransmitVideoResp
  from: InternalID
  sdp: string
}

export interface CancelVideoTransmissionMsg {
  type: MsgType.CancelVideoTransmission
  from: InternalID
}

export interface InitScreenSharingMsg {
  type: MsgType.InitScreenSharing
}

export interface StopScreenSharingMsg {
  type: MsgType.StopScreenSharing
}

export interface ScreenSharingStartedMsg {
  type: MsgType.ScreenSharingStarted
  owner: InternalID
}

export interface ScreenSharingFinishedMsg {
  type: MsgType.ScreenSharingFinished
}

export interface ICECandidateMsg {
  type: MsgType.ICECandidate
  participant: InternalID
  candidate: IceCandidate
}

export type IncomingMsg =
  | JoinMsg
  | LeaveMsg
  | TransmitVideoMsg
  | CancelVideoTransmissionMsg
  | ICECandidateMsg
  | InitScreenSharingMsg
  | StopScreenSharingMsg
export type OutgoingMsg =
  | ICECandidateMsg
  | TransmitVideoRespMsg
  | ParticipantJoinedMsg
  | ParticipantLeftMsg
  | JoinRespMsg
  | ScreenSharingStartedMsg
  | ScreenSharingFinishedMsg

export type WebRTCMsg = IncomingMsg | OutgoingMsg
