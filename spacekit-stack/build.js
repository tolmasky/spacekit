#!/usr/bin/env -S clf

const { readFileSync: read } = require("node:fs");
const { dirname, join } = require("node:path");

const spawn = require("@await/spawn");
const docker = spawn .for `docker`;

const toSHA256 = data => require("crypto")
    .createHash("sha256")
    .update(data)
    .digest("hex");


module.exports = async function build(
{
    name,
    dockerfile,
    dockerfileContents = read(dockerfile, "utf-8"),
    workspace = dirname(dockerfile)
}, ...rest)
{
    const hash = toSHA256(dockerfileContents);
    const tag = `${name}:${hash}`;

    if (await docker.trim("images", "-q", tag) !== "")
        return tag;

    console.log(`Building ${tag}`);

    await docker
    ([
        "build",
        "-t", tag,
        "-f-",
        workspace
    ], { input: dockerfileContents, stdio: "inherit" });

    return tag;
};
