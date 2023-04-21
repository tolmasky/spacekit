#!/usr/bin/env -S clf

const { readFileSync: read } = require("node:fs");
const { basename, dirname, join } = require("node:path");

const build = require("@spacekit/stack/build");

const spawn = require("@await/spawn");
const docker = spawn .for `docker`;

// Add unique ID to .spacekit?
module.exports = async function run(spacefile)
{
    const definition = require(spacefile);
    const stack = await build
    ({
        name: basename(spacefile),
        dockerfileContents: definition.dockerfileContents,
        workspace: __dirname
    });

    const { environment = [], volumes = [] } = definitions;

    await docker
    ([
        "run",
        "--rm",
        "-it",

        ...volumes
            .flatMap(({ from, to, readonly = false }) =>
                ["-v", `${from}:${to}${ readonly ? ":ro" : ""}`]),

        ...environment
            .map(({ name, value }) => ["--env", `${name}=${value}`]),

        stack,
//        ...rest
    ], { stdio: "inherit", captureStdio: false });
};
