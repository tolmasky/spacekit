const given = f => f();

const { type, caseof } = require("@reified/core/type");
const Network = require("./network");
 

const Space = type `Space`
({
    network         :of => Network,
    tty             :of => boolean,
    command         :of => array(string), // maybe?
    capabilities    :of => set(),
    volumes         :of => array(Volume),
    image           :of => Image
});

module.exports = Space;
