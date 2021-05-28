import { Attribute, Class, Obj } from '@anticrm/core'
import { Asset, IntlString, AnyComponent } from '@anticrm/status'

export interface UXLabel {
  // Declare label
  label: IntlString

  // Declare an icon
  icon?: Asset

  // Declare a placeholder
  placeholder?: IntlString
}

export interface UXDetails extends UXLabel {
  // Declare a direct presenter for field
  presenter?: AnyComponent

  color?: Asset // Define a item color if appropriate
}
/**
 * Define attribute UI extra properties.
 */
export interface UXAttribute extends Attribute, UXDetails {
  // Declare if field should be not visible
  visible?: boolean
}

export interface UXObject<T extends Obj> extends Class<T>, UXDetails {
}
