# Anticrm Platform

Any Anticrm application is nothing but a set of installed Anticrm `plugins`. 
At the very core `Platform` is a simple piece of code, which connects plugins together.

## Plugins

Plugin is an *isolated* piece of software, and a plugin never directly `import` stuff from other plugins 
(in sence of JavaScript `import` statement). Every plugin provide `Resources` to another plugins via
`Platform` runtime. Resources are accessible via a kind of PRI (Platform Resource Identifier) link.

Resource can be anything meaningful: an object in the database, `Vue` component, an asset URL, etc. 
For any `resource` there is a known `plugin`, which can *resolve* resource identifier into actual meaningful object.
Resource identifier either known statically e.g. `client-ui:component.Button` Vue component, or some dynamic string e.g. 
`mongo:0fbfaaddbbccff` or `calc:2+2`.

Plugins are loaded asynchonously, on-demand thus everything in the `Platform` wired together via asynchronous communications.

### Plugin package structure

Following is not a mandatory. In the meantime I tend to use following package structure for every Anticrm Plugin.

```
__tests__ <- tests :)
__resources__
  model.ts
  meta.ts
  strings/*.ts
*.ts <- implementation-related stuff
plugin.ts <- plugin entry point, exports plugin start function
index.ts <- A Plugin's API and PRI's. 
```

Plugin API defined in `index.ts`. It should not export any code (including internal) and should not have any side effects.
Only API and plugin's PRIs.

Basically, if a plugin depends on another, importing dependant's `index.ts` must be sufficient to start communicating with a plugin.

A `plugin.ts` available to `Platform` only. So you should never import anything from another plugin besides `index.ts`.

Runtime code not allowed to import anything from `__resources__` folder. This is solely for tooling/configuration purposes, and does not exists at runtime.
