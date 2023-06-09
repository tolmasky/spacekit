#!/usr/bin/env -S clf

const given = f => f();

const { readFileSync: read } = require("node:fs");
const { basename, dirname, join, resolve } = require("node:path");

const { ø } = require("@reified/object");
const { IsFunctionObject } = require("@reified/ecma-262");

const build = require("@spacekit/build");

const spawn = require("@await/spawn");
const docker = spawn .for `docker`;

const Image = require("@spacekit/docker/image");


const flatExtant = items => items.filter(item => !!item).flat();

// Add unique ID to .spacekit?
module.exports = async function run(spacefile, ...clientArguments)
{
    require("@spacekit/build/node_modules/@babel/register")({ cache: false, plugins: ["@reified/jsx"] });

    const absoluteSpacefile = resolve(process.env.PWD, spacefile);

    const definition = await toDefinition(absoluteSpacefile, clientArguments);console.log(definition);
    const imageID = await build(definition);
/*console.log(flatExtant
    ([
        "run",
        "--rm",
        "-i",

        definition.tty && "-t",

        definition
            .capabilities
            .map(capability => `--cap-add=${capability}`),

        definition.network && `--network=${definition.network}`,

//        "-p", "27184:27184",
        ...definition
            .volumes
            .map(({ from, to, readonly = false }) =>
                ["-v", `${from}:${to}${ readonly ? ":ro" : ""}`]),

        definition
            .environment
            .map(({ name, value }) => ["--env", `${name}=${value}`]),

        imageID,

        definition.command
    ]));*/
    await docker(flatExtant
    ([
        "run",
        "--rm",
        "-i",

        definition.tty && "-t",

        [...definition.capabilities]
            .map(capability => `--cap-add=${capability}`),

        ...definition.network.toCommandLineArguments(),

//        "-p", "27184:27184",
        definition
            .volumes
            .map(({ from, to, readonly = false }) =>
                ["-v", `${from}:${to}${ readonly ? ":ro" : ""}`]),

        definition
            .environment
            .map(({ name, value }) => ["--env", `${name}=${value}`]),

        imageID,

        definition.command
    ]), { stdio: "inherit", captureStdio: false });
};

async function toDefinition(spacefile, clientArguments)
{
    const fDefinition = require(spacefile);console.log("hi");
    console.log(fDefinition);
    const eDefinition = IsFunctionObject(fDefinition) ?
        await fDefinition(...clientArguments) :
        fDefinition;

    const definition =
    ({
        ...eDefinition,
        dockerfileContents: Image.toDockerfileContents(eDefinition.image),
    //    environment: Object.entries(ø(definition.environment),
        capabilities: eDefinition.capabilities || new Set(),
        command: eDefinition.command || [],
        environment: eDefinition.environment || [],
        name: eDefinition.name || basename(spacefile),
        volumes: eDefinition.volumes || [],
        workspace: eDefinition.workspace || dirname(spacefile),
    });

    return definition;
}
