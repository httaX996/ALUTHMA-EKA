const commands = [];

function subCommandHandler(commandConfig, handlerFunc) {
    var currentCommand = commandConfig;
    
    // විධාන රටාව (Pattern) පරීක්ෂා කිරීම
    if (!currentCommand.pattern) {
        currentCommand.pattern = '';
    }
    
    // ක්‍රියාකාරී (Function) කොටස සම්බන්ධ කිරීම
    currentCommand.function = handlerFunc;
    
    // fromMe අගය පරීක්ෂා කිරීම
    if (!currentCommand.fromMe) {
        currentCommand.fromMe = false;
    }
    
    // dontAddCommandList අගය පරීක්ෂා කිරීම
    if (!currentCommand.dontAddCommandList) {
        currentCommand.dontAddCommandList = false;
    }
    
    // filename පරීක්ෂා කිරීම
    if (!currentCommand.filename) {
        currentCommand.filename = "command.js";
    }
    
    // category පරීක්ෂා කිරීම
    if (!currentCommand.category) {
        currentCommand.category = "misc";
    }
    
    // විධානය commands ලැයිස්තුවට එකතු කිරීම
    commands.push(currentCommand);
    
    return currentCommand;
}

// මොඩියුලය හරහා විධාන ක්‍රම සහ ලැයිස්තුව Export කිරීම
module.exports = {
    'cmd': subCommandHandler,
    'AddCommand': subCommandHandler,
    'Function': subCommandHandler,
    'Module': subCommandHandler,
    'commands': commands
};
