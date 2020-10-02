module.exports = {
    info: (a,b) => {
        console['log']("========================================");
        console['log']("LOG > "+a);
        if(b) {console.log("Tip: "+b)};
        console['log']("========================================");
    },
    warn: (a,b) => {
        console['warn']("========================================");
        console['warn']("WARN > "+a);
        if(b) {console.log("Tip: "+b)};
        console['warn']("========================================");
    },
    err: (a,b) => {
        var string = "===>\nNew Error:\n"+a+"\nEnd Error\n===>";
        if(!b) {
            throw new Error(string);
        } else {
            console.warn(string);
        }
    },
};