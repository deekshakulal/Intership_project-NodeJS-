function ResponsePrototype() {
    return {
        send: function(response) {
            console.log(response)
        }
    }
}


function ResponseFactory(code, status, message) {
    
    let response = Object.create(ResponsePrototype, {
        code: { writable: false, value: code },
        status: { writable: false, value: status },
        message: { writable: false, value: message}
    });

    return response;
}

let success = ResponseFactory(200, 'OK', 'Successful Respose');
let failure = ResponseFactory(400, 'FAILED', 'Failure Response');

console.log(success.send == failure.send);