---
title: Code Structure
menuPosition: 2
---

Here's the breakdown of the repo:

## Packages
* [@anticrm/foundation](/apis/foundation) -- Anticrm Platform Foundation Types.
* [@anticrm/platform](/apis/platform) -- Plugin architecture and implementation. Client-side only.
* [@anticrm/core](/apis/core) -- Core concepts shared by Client plugins and Server components.
* [@anticrm/domains](/apis/domains) -- Indexers and Domains.
* [@anticrm/text](/apis/text) -- Markdown related utilities.
* [@anticrm/model](/apis/model) -- Utils to define and manage domain models. Used by tooling, not a part of client/server runtimes.
* [@anticrm/rpc](/apis/rpc) -- Remote Procedure Call related.

Package Dependencies:

{{< mermaid >}}

graph BT
    platform --> foundation
    domains --> core & text
    rpc --> foundation
    model --> domains & core & platform

{{< /mermaid >}}

Plugin Dependencies:

{{< mermaid >}}

graph BT
    ui

{{< /mermaid >}}
