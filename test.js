#!/usr/bin/env node
import chalk from "chalk"

import { python } from "./index.js"

const EXAMPLE_INPUT = `a = 1; a += 1`
const EXAMPLE_OUTPUT = "export var a=1;a++"

function success(message) {
    console.log(chalk.green(message))
}

function danger(message) {
    console.log(chalk.red(message))
}

async function test_without_backticks() {
    const output = await python({
        content: EXAMPLE_INPUT,
        filename: "test_with_backticks.py",
    })

    if (!output.code.includes(EXAMPLE_OUTPUT)) {
        throw "test_without_backticks failed"
    }

    return output
}

async function test_with_backticks() {
    const output = await python({
        content: `
        \`${EXAMPLE_INPUT}\``,
        filename: "test_with_backticks.py",
    })

    if (!output.code.includes(EXAMPLE_OUTPUT)) {
        throw "test_with_backticks failed"
    }

    return output
}

async function test_syntax_error() {
    return new Promise((resolve, reject) => {
        python({
            content: "    this ain't Python    ",
            filename: "test_syntax_error.py",
        })
            // we want an exception in this case!
            .then(reject)
            .catch(resolve)
    })
}

async function tests() {
    await test_without_backticks()
    await test_with_backticks()
    await test_syntax_error()
    return true
}

function main() {
    tests()
        .then((_) => success("All tests passed!"))
        .catch((err) => danger(`Something went wrong: ${err}`))
}

main()
