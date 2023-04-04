import * as fs from "fs"
import * as path from "path"
import {exec} from "child_process"

function debug(...args) {
    /* can be enabled when debugging */

    // console.debug(...args)
}

String.prototype._hashCode = function () {
    let hash = 0
    let i, chr
    if (this.length === 0) return hash
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

function clean(python) {
    /**
     * Due to editor limitations, in order to properly detect the contents of <script> as Python,
     * it needs to be inside a JS string (e.g. `print("This is Python")`).
     * This method removes these characters (if applicable) so transcrypt can read it.
     *
     * @param {string} python
     * @return {string}
     */

    python = python.trim() // + extra whitespace
    if (python.charAt(0) === "`") {
        // skip first
        python = python.slice(1)
    }

    if (python.slice(-1) === "`") {
        // skip last
        python = python.slice(0, -1)
    }

    return python
}

/**
 *
 * @param {string} python code
 * @param {string} filepath
 * @param {boolean} with_map emit .map file too?
 * @return {Promise<{code: string, map: string?}>}
 */
async function py_to_js(python, filepath, with_map = false) {
    const filepath_hash = String(filepath._hashCode())
    debug("Start py to JS")
    return new Promise((resolve, reject) => {
        // every (unique) file name gets its own build folder, so the imports don't get confused.
        // const workdir = path.join(tmpdir(), "vite-svelte-transcrypt");
        const workdir = path.join(".transcrypt-build", `build-${filepath_hash}`)
        fs.mkdirSync(workdir, {recursive: true})

        const input = path.join(workdir, "input.py")
        fs.writeFileSync(input, clean(python))

        const command = "/usr/bin/env python -m transcrypt --map"

        exec(`${command} ${input}`, (error, stdout, stderr) => {
            if (error) {
                let err_msg = stderr ?? stdout;
                if (err_msg.includes("No module named transcrypt")) {
                    err_msg = "Python Dependency Error: Please run `pip install transcrypt`"
                }

                debug("Transcrypt error!")
                return reject(new Error(err_msg))
            }
            debug("Transcrypt success")

            const output_path = path.join(workdir, "__target__/input.js")
            let code = fs.readFileSync(output_path, {
                encoding: "utf8",
                flag: "r",
            })

            const abspath = path.resolve(
                path.join(workdir, `__target__/org.transcrypt.__runtime__.js`)
            )
            code = code.replace(`./org.transcrypt.__runtime__.js`, abspath)

            const result = {code}

            if (with_map) {
                const map_path = path.join(workdir, "__target__/input.map")
                let map = fs.readFileSync(map_path, {
                    encoding: "utf8",
                    flag: "r",
                })
                map = map.replace(
                    "input.js",
                    path.resolve(path.join(workdir, "__target__/input.js"))
                )
                map = map.replace(
                    "input.py",
                    path.resolve(path.join(workdir, "__target__/input.py"))
                )
                result["map"] = map
            }
            // finally:
            debug("Py to JS done!")
            resolve(result)
            // can't clean up at this point, since runtime should still exist later!
        })
    })
}

export async function python({content, filename, attributes}) {
    return await py_to_js(content, filename)
}
