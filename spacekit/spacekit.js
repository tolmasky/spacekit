#!/usr/bin/env -S clf

const run = require("@spacekit/run");


// UGH. Need to support multiple commands in CLF!!!!
module.exports = async function (command, ...rest)
{
    if (command === "run")
        return await run(...rest);
}
