# Vite Svelte Transcrypt

Preprocessor for blocks of Python in Svelte templates (using Vite and Transcrypt)

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

def increment():
    global window # optional
    global document # optional
    window.alert("You can now call window's methods or perform DOM manipulation with document!")
`
</script>
```

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