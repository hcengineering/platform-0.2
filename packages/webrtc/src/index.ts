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
  CancelVideoTransmission = 'cancel-video-transmission'
}

export interface Participant {
  internalID: string
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
}

export interface TransmitVideoMsg {
  type: MsgType.TransmitVideo
  from: string
  sdp: string
}

export interface TransmitVideoRespMsg {
  type: MsgType.TransmitVideoResp
  from: string
  sdp: string
}

export interface CancelVideoTransmission {
  type: MsgType.CancelVideoTransmission
  from: string
}

export interface ICECandidateMsg {
  type: MsgType.ICECandidate
  participant: string
  candidate: IceCandidate
}

export type IncomingMsg =
  | JoinMsg
  | LeaveMsg
  | TransmitVideoMsg
  | CancelVideoTransmission
  | ICECandidateMsg
export type OutgoingMsg =
  | ICECandidateMsg
  | TransmitVideoRespMsg
  | ParticipantJoinedMsg
  | ParticipantLeftMsg
  | JoinRespMsg

export type WebRTCMsg = IncomingMsg | OutgoingMsg
