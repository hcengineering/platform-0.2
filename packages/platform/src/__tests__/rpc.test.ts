//
// Copyright © 2020 Anticrm Platform Contributors.
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
//

/* eslint-env jest */

import { RpcError, Request, Response, serialize, readResponse, readRequest } from '../rpc'

describe('rpc', () => {
  const emptyResponse: Response<any> = {}

  it('should serialize response', () => {
    const response: Response<string> = {
      result: 'successful result',
      id: 12345
    }
    expect(serialize(response)).toBe('{"result":"successful result","id":12345}')
  })

  it('should serialize error response', () => {
    const error: RpcError = {
      code: 500,
      message: 'error500',
      data: { a: 'aValue', b: true }
    }
    const errorResponse: Response<string> = {
      result: 'error result',
      id: 7890,
      error: error
    }
    expect(serialize(errorResponse)).toBe('{"result":"error result","id":7890,"error":{"code":500,"message":"error500","data":{"a":"aValue","b":true}}}')
  })

  it('should serialize empty response', () => {
    expect(serialize(emptyResponse)).toBe('{}')
  })

  it('should create request without parameters', () => {
    const request = new Request('m')
    expect(request.id).toBeUndefined()
    expect(request.method).toBe('m')
    expect(request.params).toBeDefined()
    expect(request.params.length).toBe(0)
  })

  it('should create request with parameters', () => {
    const request = new Request('m', 'param1', 2, true)
    expect(request.id).toBeUndefined()
    expect(request.method).toBe('m')
    expect(request.params).toBeDefined()
    expect(request.params.length).toBe(3)
    expect(request.params[0]).toBe('param1')
    expect(request.params[1]).toBe(2)
    expect(request.params[2]).toBe(true)
  })

  it('should serialize request without parameters', () => {
    const request = new Request('methodNoParameters')
    expect(serialize(request)).toBe('{"method":"methodNoParameters","params":[]}')
  })

  it('should serialize request with parameters', () => {
    const request = new Request('methodWithParameters', 'param1', 2, true)
    expect(serialize(request)).toBe('{"method":"methodWithParameters","params":["param1",2,true]}')
  })

  it('should serialize request with id', () => {
    const request: Request<any[]> = {
      id: 'someId',
      method: 'someMethod',
      params: ['1', 2, true, {}]
    }
    expect(serialize(request)).toBe('{"id":"someId","method":"someMethod","params":["1",2,true,{}]}')
  })

  it('should read response', () => {
    const response: Response<string> = {
      result: 'error result',
      id: 7890,
      error: { code: 500 }
    }
    expect(readResponse('{"result":"error result","id":7890,"error":{"code":500}}')).toEqual(response)
  })

  it('should read empty response', () => {
    expect(readResponse('{}')).toEqual(emptyResponse)
  })

  it('should read request', () => {
    const request: Request<any[]> = {
      id: 'id',
      method: 'method',
      params: ['1', 2, true, { a: 'a' }]
    }
    expect(readRequest('{"id":"id","method":"method","params":["1",2,true,{"a":"a"}]}')).toEqual(request)
  })

  it('should fail reading broken data', () => {
    expect(() => readResponse('bad response')).toThrowError()
    expect(() => readResponse('{"result":')).toThrowError()
    expect(() => readResponse('')).toThrowError()
    expect(() => readRequest('bad request')).toThrowError()
    expect(() => readRequest('{"method":"method",')).toThrowError()
    expect(() => readRequest('')).toThrowError()
  })
})
