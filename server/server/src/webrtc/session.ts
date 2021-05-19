import { MsgType, OutgoingMsg } from '@anticrm/webrtc'
import { IceCandidate, MediaPipeline, WebRtcEndpoint } from 'kurento-client'

export class Session {
  private readonly pipeline: MediaPipeline
  public readonly outgoingMedia: Promise<WebRtcEndpoint>
  private readonly incomingMedia = new Map<string, Promise<WebRtcEndpoint>>()
  public readonly send: (msg: OutgoingMsg) => void
  public readonly name: string

  constructor (
    name: string,
    pipeline: MediaPipeline,
    send: (msg: OutgoingMsg) => void
  ) {
    this.pipeline = pipeline
    this.send = send
    this.name = name

    this.outgoingMedia = this.createEndpoint(name)
  }

  async addICECandidate (candidate: IceCandidate, from: string): Promise<void> {
    const endpointP = this.name === from
      ? this.outgoingMedia
      : this.incomingMedia.get(from)

    if (endpointP === undefined) {
      return
    }

    const endpoint = await endpointP

    await endpoint.addIceCandidate(candidate as never as RTCIceCandidate)
  }

  async initVideoTransmission (session: Session, sdpOffer: string): Promise<void> {
    const endpoint = await this.getEndpointForSession(session)
    this.send({
      type: MsgType.TransmitVideoResp,
      from: session.name,
      sdp: await endpoint.processOffer(sdpOffer)
    })

    await endpoint.gatherCandidates((err) => console.error(err))
  }

  async cancelVideoTransmission (from: string): Promise<void> {
    const endpoint = await this.incomingMedia.get(from)

    if (endpoint === undefined) {
      return
    }

    await endpoint.release()
    this.incomingMedia.delete(from)
  }

  async close (): Promise<void> {
    await Promise.all(
      [...this.incomingMedia.values()]
        .map(async endpoint => await endpoint.then(async x => await x.release()))
    )

    this.incomingMedia.clear()

    await (await this.outgoingMedia).release()
  }

  private async getEndpointForSession (session: Session): Promise<WebRtcEndpoint> {
    if (session.name === this.name) {
      return await this.outgoingMedia
    }

    const existingEndpoint = this.incomingMedia.get(session.name)

    if (existingEndpoint !== undefined) {
      return await existingEndpoint
    }

    const endpoint = this.createEndpoint(session.name)

    this.incomingMedia.set(session.name, endpoint)

    const remotePeer = await session.outgoingMedia
    await remotePeer.connect(await endpoint)

    return await endpoint
  }

  private async createEndpoint (sender: string): Promise<WebRtcEndpoint> {
    const endpoint = await this.pipeline.create('WebRtcEndpoint')
    await endpoint.setMaxVideoRecvBandwidth(2000)
    await endpoint.setMaxVideoSendBandwidth(2000)
    endpoint.on('IceCandidateFound', (event) => {
      this.send({
        type: MsgType.ICECandidate,
        participant: sender,
        candidate: event.candidate
      })
    })

    return endpoint
  }
}
