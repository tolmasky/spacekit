const given = f => f();

const { I } = require("@reified/ecma-262");
const type = require("@reified/core/type");
 

module.exports = type `Volume`
({
    from        :of => string,
    to          :of => string,
    readonly    :of => boolean `=` (false)
});
