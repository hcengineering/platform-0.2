//
// Copyright © 2021 Anticrm Platform Contributors.
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

import { TelegramIntegrator } from '../integrators/telegramIntegrator'

describe('service', () => {
  beforeAll(async () => {
    jest.setTimeout(60000)
  })

  it('signIn', async () => {
    // Hardcode input parameters
    const phone = '+9996621111'
    const confirmCode = '222222'
    const username = 'vasya'

    const integrator = new TelegramIntegrator(username, undefined, true)

    const hash = await integrator.sendAuthCode(phone)
    expect(hash.length).toBeGreaterThan(0)
    const telegramToken = await integrator.signIn(phone, confirmCode, hash)
    expect(telegramToken).not.toBeUndefined()
  })

  it('multiple login', async () => {
    // Hardcode input parameters
    const phoneVasya = '+9996623333'
    const confirmCodeVasya = '222222'
    const usernameVasya = 'vasya'
    const phonePetya = '+9996622222'
    const confirmCodePetya = '222222'
    const usernamePetya = 'petya'

    const integratorVasya = new TelegramIntegrator(usernameVasya, undefined, true)

    const hashVasya = await integratorVasya.sendAuthCode(phoneVasya)
    expect(hashVasya.length).toBeGreaterThan(0)
    const telegramTokenVasya = await integratorVasya.signIn(phoneVasya, confirmCodeVasya, hashVasya)
    expect(telegramTokenVasya).not.toBeUndefined()

    const integratorPetya = new TelegramIntegrator(usernamePetya, undefined, true)
    const hashPetya = await integratorPetya.sendAuthCode(phonePetya)
    expect(hashPetya.length).toBeGreaterThan(0)
    const telegramTokenPetya = await integratorPetya.signIn(phonePetya, confirmCodePetya, hashPetya)
    expect(telegramTokenPetya).not.toBeUndefined()
  })
})
