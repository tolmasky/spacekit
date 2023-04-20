#!/usr/bin/env -S clf

const { readFileSync: read } = require("node:fs");
const { basename, dirname, join } = require("node:path");

const build = require("@spacekit/stack/build");

const spawn = require("@await/spawn");
const docker = spawn .for `docker`;


module.exports = async function run(spacefile)
{
    const definition = require(spacefile);
    const stack = await build
    ({
        name: basename(spacefile),
        dockerfileContents: definition,
        workspace: __dirname
    });

    await docker
    ([
        "run",
        "--rm",
        "-it",
/*        ...volumes
            .map(({ from, to, readonly = false }) =>
                ["-v", `${from}:${to}${ readonly ? ":ro" : ""}`])
            .flat(),
        ...(port ? ["--env", `HOST_SETUP_PORT=${port}`] : []),*/
        stack,
//        ...rest
    ], { stdio: "inherit", captureStdio: false });
};
