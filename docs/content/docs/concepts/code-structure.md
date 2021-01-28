---
title: Code Structure
menuPosition: 2
---

Here's the breakdown of the repo:

## Packages
* [@anticrm/foundation](/apis/foundation) -- Anticrm Platform Foundation Types.
* [@anticrm/platform](/apis/platform) -- Plugin architecture and implementation. Client-side only.
* [@anticrm/core](/apis/core) -- Core concepts shared by Client plugins and Server components.
* [@anticrm/text](/apis/text) -- Markdown related utilities.
* [@anticrm/model](/apis/model) -- Utils to define and manage domain models. Used by tooling, not a part of client/server runtimes.

File Dependencies:

{{< mermaid >}}

graph BT
    platform/index --> foundation/index
    core/domains --> core/classes
    core/rpc --> foundation/index
    core/tx --> core/classes
    core/model --> core/classes & core/tx
    core/textmodel
    core/indices/model --> core/classes & core/tx & core/model
    core/indices/vdoc --> core/tx & core/model
    core/indices/text --> core/classes & core/tx &  core/model & core/domains
    core/indices/title --> core/classes & core/tx & core/model & core/domains

{{< /mermaid >}}

