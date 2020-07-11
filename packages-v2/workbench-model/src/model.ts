import core, { Builder } from '@anticrm/platform-model'
import workbench from '.'

export default (S: Builder) => {

  S.createClass(workbench.class.Application, core.class.Doc, {
    label: S.newInstance(core.class.String, {}),
    icon: S.newInstance(core.class.Type, {})
  })

  S.createDocument(workbench.class.Application, {
    label: 'Супер аппликуха'
  })

}
