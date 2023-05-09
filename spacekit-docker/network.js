const given = f => f();

const { I } = require("@reified/ecma-262");
const { caseof, type } = require("@reified/core/type");
 

// https://docs.docker.com/engine/reference/run/#network-settings
const Network = type `Network`
([
    caseof `None`,

    caseof `Bridge`,

    caseof `Host`,

    caseof `Container` (id => ({ id })),

    caseof `Network` (name => ({ name }))
],
{
    parse: given((
        ContainerNetworkRegExp = /^(container:)?(.+)$/) =>        
        name =>
            name instanceof Network ? name :
            name === "none" ? Network.None :
            name === "bridge" ? Network.Bridge :
            name === "host" ? Network.Host : given((
                [_, isContainerNetwork, rest] = name
                    [I `::String.prototype.match`] (ContainerNetworkRegExp) ||
                    [, false]) =>
                isContainerNetwork ?
                    Network.Container(rest) :
                    Network(name))),

    prototype:
    {
        toCommandLineArguments()
        {
            return ["--network", caseof (this,
            {
                [Network.None]: () => "none",
                [Network.Bridge]: () => "bridge",
                [Network.Host]: () => "host",
                [Network.Container]: ({ id }) => `container:${id}`,
                [Network]: ({ name }) => name
            })];
        }
    }
});

module.exports = Network;
