Debug = {
    debugMode : true,
    log: function(errors){
        if(Debug.debugMode)
            console.log(errors);
    },
    error: function(errors){
        if(Debug.debugMode)
            console.error(errors);
    },
    info: function(errors){
        if(Debug.debugMode)
            console.info(errors);
    }
};