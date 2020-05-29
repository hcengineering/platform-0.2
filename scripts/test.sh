#!/bin/bash

# T E S T  P A C K A G E S
yarn workspace @anticrm/platform run test && \
yarn workspace @anticrm/platform-core run test && \
yarn workspace @anticrm/platform-core-i18n run test && \

# L I N T  P A C K A G E S
yarn workspace @anticrm/platform run lint $1 && \
yarn workspace @anticrm/platform-core run lint $1 && \
yarn workspace @anticrm/platform-core-i18n run lint $1
