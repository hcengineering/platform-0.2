---
title: Code Structure
menuPosition: 2
---

Here's the breakdown of the repo:

## Packages

* [@anticrm/platform](/apis/platform) -- Plugin architecture and implementation. Client-side only.
* @anticrm/core -- Core concepts shared by Client plugins and Server components.
* @anticrm/model -- Utils to define and manage domain models. Used by tooling, not a part of client/server runtimes.

Dependencies:

{{< mermaid >}}

graph BT
    platform --> foundation
    core --> foundation
    model --> core

{{< /mermaid >}}

