Workbench Plugin
================

About Workbench Plugin...

Model
-----

.. code-block:: typescript

    export interface Application extends Doc {
      label: StringProperty
      icon: Asset
      main: AnyComponent
      appClass: Ref<Class<VDoc>>
    }
