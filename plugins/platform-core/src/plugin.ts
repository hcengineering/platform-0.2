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

import { newClient } from '@anticrm/client'
import { PlatformStatusCodes } from '@anticrm/foundation'
import { Platform, PlatformStatus, Severity, Status } from '@anticrm/platform'
import core, { CoreService } from './index'

/*!
 * Anticrm Platform™ Core Plugin
 * © 2020 Anticrm Platform Contributors. All Rights Reserved.
 * Licensed under the Eclipse Public License, Version 2.0
 */
export default async (platform: Platform): Promise<CoreService> => {
  const host = platform.getMetadata(core.metadata.WSHost) ?? 'localhost'
  const sPort = platform.getMetadata(core.metadata.WSPort) ?? '3000'

  const token = platform.getMetadata(core.metadata.Token)

  const userId = platform.getMetadata(core.metadata.WhoAmI) as string

  if (token === undefined) {
    platform.broadcastEvent(PlatformStatus, new Status(Severity.ERROR, PlatformStatusCodes.AUTHENTICATON_REQUIRED, 'Authentication is required'))
    return await Promise.reject(new Error('authentication required'))
  }

  const client = await newClient(token, userId, host, parseInt(sPort))

  const service: CoreService = {
    ...client,
    getUserId: () => userId
  }
  return service
}
