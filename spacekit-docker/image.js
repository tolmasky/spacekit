const given = f => f();

const { I } = require("@reified/ecma-262");
const { type, caseof } = require("@reified/core/type");
const Network = require("./network");
 

const Instruction = type `Instruction`
([
    caseof `copy`
    ({
        source      :of => string,
        destination :of => string
    }),

    caseof `run`
    ({
        value :of => string
    }),

    caseof `env`
    ({
        key     :of => string,
        value   :of => string
    }),

    caseof `entrypoint`
    ({
        command :of => array(string)
    }),
    
    caseof `workdir`
    ({
        dirname   :of => string
    })
],
{
    toDockerfileContents: target => caseof(target,
    {
        [Instruction.copy]: ({ source, destination }) => `COPY ${source} ${destination}`,
        [Instruction.run]: ({ value }) => `RUN ${value}`,
        [Instruction.env]: ({ key, value }) => `ENV ${key}="${value}"`,
        [Instruction.entrypoint]: ({ command }) => `ENTRYPOINT ${JSON.stringify(command)}`,
        [Instruction.workdir]: ({ dirname }) => `WORKDIR ${dirname}`
    })
});

const Image = type `Image`
({
    from            :of => string,
    instructions    :of => array(Instruction)
},
{
    toDockerfileContents: image =>
        `FROM ${image.from}\n\n${image
            .instructions
            [I `::Array.prototype.map`] (Instruction.toDockerfileContents)
            [I `::Array.prototype.join`] ("\n\n")}`
});

module.exports = Image;

module.exports.Image = Image;

module.exports.Instruction = Instruction;
