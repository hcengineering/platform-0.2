#!/bin/bash
#
#  Copyright © 2020 Anticrm Platform Contributors.
#  
#  Licensed under the Eclipse Public License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License. You may
#  obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
#  
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

# T E S T  P A C K A G E S
yarn workspace @anticrm/platform run test && \
yarn workspace @anticrm/platform-core run test && \
yarn workspace @anticrm/platform-core-i18n run test && \
yarn workspace @anticrm/platform-ui run test && \

# L I N T  P A C K A G E S
yarn workspace @anticrm/platform run lint $1 && \
yarn workspace @anticrm/platform-core run lint $1 && \
yarn workspace @anticrm/platform-core-i18n run lint $1 && \
yarn workspace @anticrm/platform-ui run lint $1 && \

# B U I L D  D E M O  A P P L I C A T I O N
yarn workspace launch build && \

# B U I L D  P A C K A G E S
yarn workspace @anticrm/platform run build
