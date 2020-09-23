<script type="ts">
  import Prism from 'prismjs'
  import 'prism-svelte'

  export let text: string = ''
  export let code: string = ''
  export let label: string = ''

  $: highlighted = Prism.highlight(code, Prism.languages.svelte, 'svelte')
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Open+Sans:400,700"
    type="text/css"
  />
  <link
    rel="stylesheet"
    href="https://tutsplus.github.io/syntax-highlighter-demos/highlighters/Prism/prism_okaidia.css"
  />
</svelte:head>

<h3>{label}</h3>
<div class="page-block">
  <div class="text">{text}</div>
  <div class="preview">
    <slot />
  </div>
  <div class="my-code">
    <pre class="language-svelte">
      {@html highlighted}
    </pre>
  </div>
</div>

<style lang="scss">
  :global {
    /* PrismJS 1.21.0
    https://prismjs.com/download.html#themes=prism-tomorrow */
    /**
    * prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML
    * Based on https://github.com/chriskempson/tomorrow-theme
    * @author Rose Pritchard
    */

    code[class*='language-'],
    pre[class*='language-'] {
      color: #ccc;
      background: none;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      font-size: 1em;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      line-height: 1.5;

      -moz-tab-size: 4;
      -o-tab-size: 4;
      tab-size: 4;

      -webkit-hyphens: none;
      -moz-hyphens: none;
      -ms-hyphens: none;
      hyphens: none;
    }

    /* Code blocks */
    pre[class*='language-'] {
      padding: 1em;
      margin: 0.5em 0;
      overflow: auto;
    }

    :not(pre) > code[class*='language-'],
    pre[class*='language-'] {
      background: #2d2d2d;
    }

    /* Inline code */
    :not(pre) > code[class*='language-'] {
      padding: 0.1em;
      border-radius: 0.3em;
      white-space: normal;
    }

    .token.comment,
    .token.block-comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: #999;
    }

    .token.punctuation {
      color: #ccc;
    }

    .token.tag,
    .token.attr-name,
    .token.namespace,
    .token.deleted {
      color: #e2777a;
    }

    .token.function-name {
      color: #6196cc;
    }

    .token.boolean,
    .token.number,
    .token.function {
      color: #f08d49;
    }

    .token.property,
    .token.class-name,
    .token.constant,
    .token.symbol {
      color: #f8c555;
    }

    .token.selector,
    .token.important,
    .token.atrule,
    .token.keyword,
    .token.builtin {
      color: #cc99cd;
    }

    .token.string,
    .token.char,
    .token.attr-value,
    .token.regex,
    .token.variable {
      color: #7ec699;
    }

    .token.operator,
    .token.entity,
    .token.url {
      color: #67cdcc;
    }

    .token.important,
    .token.bold {
      font-weight: bold;
    }
    .token.italic {
      font-style: italic;
    }

    .token.entity {
      cursor: help;
    }

    .token.inserted {
      color: green;
    }
  }
  .page-block {
    width: 100%;
    min-height: 200px;
    display: flex;
    flex-direction: row;
    align-items: stretch;

    .text {
      margin: 10px;
      // flex-grow: 1;
    }
    .my-code {
      background-color: hsl(210, 25%, 10%);
      color: black;
      // margin: 10px;
      flex-grow: 2;
    }
    .preview {
      background-color: hsl(210, 25%, 20%);
      margin: 10px;
      flex-grow: 2;
      height: 100%;
    }
    .language-svelte {
      // height: 100%;
    }
  }
</style>
