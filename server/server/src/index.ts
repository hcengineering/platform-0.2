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

// import { TelegramIntegrator } from './integrators/telegramIntegrator'
import { start } from './server'

const mongodbUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'

console.log('mongodb uri: ...' + mongodbUri.substring(25))

// for demo uncomment it, push your data, and input apiId, ApiHash in environment
// statTelegramDemo() // eslint-disable-line

start(18080, mongodbUri).then(() => { // eslint-disable-line
  console.log('Server started')
}, (err) => {
  console.error('Server is failed to start', err)
})

// async function statTelegramDemo (): Promise<void> {
//   const platfromUserName = 'john.appleseed@gmail.com'
//   const phoneNumber = '+77771234567'
//   let token: string | undefined

//   // token = 'YOUR_SAVED_TOKEN'
//   const client = new TelegramIntegrator(platfromUserName, token)
//   if (token === undefined) {
//     const hash = await client.sendAuthCode(phoneNumber)
//     const code = '12345' // run in debug and change code to actually here
//     token = await client.signIn(phoneNumber, code, hash)
//     if (token === undefined) { // use second factor
//       token = await client.signInWithPassword(phoneNumber, code, 'YOUR_SECOND_FACTOR_PASSWORD')
//     }
//     console.log('save this token for next time')
//     console.log(token)
//   } else {
//     await client.start()
//   }
// }
