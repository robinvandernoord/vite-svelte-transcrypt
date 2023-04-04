# Vite Svelte Transcrypt

[proof of concept] Preprocessor for blocks of Python in Svelte templates (using Vite and Transcrypt)

```bash
pip install transcrypt
npm install --save vite-svelte-transcrypt
```

## Usage

```ts
// example vite.config.js or vite.config.ts

import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess';
import {python} from "vite-svelte-transcrypt"; // <-

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte({
        preprocess: sveltePreprocess({
            aliases: [ // register lang="python" and .py files as Python
                ['py', 'python'],
                ['python', 'python'],
            ],
            python // <- 
        }),
    })],
})

```

```sveltehtml
<!-- SomeComponent.svelte -->
<script lang="python">`
count = 0

def increment():
    count += 1
`
</script>

<button on:click={increment}>
    count is {count}
</button>
```

Note: the backticks (``` ` ```) are not required, but can improve Language Injection features of some editors (i.e. you
can tell Pycharm the 'string' is supposed to be Python.)

### Advanced

You also have access to all Javascript globals. In order to prevent the editor from complaining it doesn't know these,
you can use the global keyword:

```sveltehtml

<script lang="python">`
count = 0

def interop`()
:
global
window
#
optional
global
document
#
optional
window.alert("You can now call window's methods or perform DOM manipulation with document!")
        `

</script>
```

### Caveats

This whole project is **just a proof of concept** and should NOT be used in production!
The whole Transcrypt JS runtime is included for every `<script>` with `lang=python`, so unless Vite does a great job of
optimizing this, there is a lot of duplicate code. It is also of course much slower than just using JS.
Additionally, Transcrypt does not support a lot of Python libraries at this point, so most useful imports will not work.

This module also creates a lot of junk files in the `.transcrypt-build` directory, since the output is used AFTER the
preprocess function ends.
So cleanup at the end of this function is impossible, since the files are still needed later on.
If this module was used in a big project, this junk folder could get quite big after a while.

When working with JS objects from Python, it still expects the 'new' keyword. Since Python does not have this,
Transcrypt provides the `__new__` helper:

```sveltehtml

<script lang="python">`
def interop():
    # optional
    global Object
    global URLSearchParams
    global location
    global __new__

    print(
         Object.fromEntries(__new__(URLSearchParams(location.search)))
    )
    # = Object.fromEntries(new URLSearchParams(location.search))
`
</script>
```