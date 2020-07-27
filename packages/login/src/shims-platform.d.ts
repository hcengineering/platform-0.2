import { Platform } from '@anticrm/platform'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $platform: Platform
  }
}
