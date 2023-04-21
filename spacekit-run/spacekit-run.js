#!/usr/bin/env -S clf

const given = f => f();

const { readFileSync: read } = require("node:fs");
const { basename, dirname, join } = require("node:path");

const { ø } = require("@reified/object");
const { IsFunctionObject } = require("@reified/foundation/types-and-values");

const build = require("@spacekit/build");

const spawn = require("@await/spawn");
const docker = spawn .for `docker`;


const flatExtant = items => items.filter(item => !!item).flat();

// Add unique ID to .spacekit?
module.exports = async function run(spacefile, ...clientArguments)
{
    const definition = await toDefinition(spacefile, clientArguments);
    const imageID = await build(definition);

    await docker(flatExtant
    ([
        "run",
        "--rm",
        "-it",

        definition
            .capabilities
            .map(capability => `--cap-add=${capability}`),

        definition.network && `--network=${definition.network}`,

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
    const fDefinition = require(spacefile);
    const eDefinition = IsFunctionObject(fDefinition) ?
        await fDefinition(...clientArguments) :
        fDefinition;
    const definition =
    ({
        ...eDefinition,
    //    environment: Object.entries(ø(definition.environment),
        capabilities: eDefinition.capabilities || [],
        command: eDefinition.command || [],
        environment: eDefinition.environment || [],
        name: eDefinition.name || basename(spacefile),
        volumes: eDefinition.volumes || [],
        workspace: eDefinition.workspace || dirname(spacefile),
    });

    return definition;
}
