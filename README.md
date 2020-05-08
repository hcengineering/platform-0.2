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
