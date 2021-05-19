/* eslint-env jest */

export default class {
  onNewClient (): any {
    return {
      onWSMsg: jest.fn(),
      onClose: jest.fn()
    }
  }
}
