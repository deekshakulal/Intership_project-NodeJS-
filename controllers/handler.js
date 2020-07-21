// module.exports.Result = function(rescode, stat, msg, doc, res){
//     var result = {};
            
//     result.responseCode = rescode;
//     result.status = stat;
//     result.message = msg;
//     result.data = doc;

//     res.send(result);

// }

// module.exports.Error = function(code, stat, msg, res){
//     var error = {};

//     error.code = code;
//     error.status = stat;
//     error.message = msg;
    
//     res.send(error);
// }

module.exports.resultHandler = function(rescode, stat, msg, doc, res){
    var result = {};
            
    result.responseCode = rescode;
    result.status = stat;
    result.message = msg;

    if(doc !=="error"){        
        result.data = doc;
    }
    
    res.send(result);
}