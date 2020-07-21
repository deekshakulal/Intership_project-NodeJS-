module.exports = class Response{
    constructor(resCode){
        let res = {code : resCode,status : 'SUCCESS'};
        this.setData = (data) => { res.data = data;      return this; 	}
        this.setError = (err) => { res.error = err; return this;}
        this.send = (resObj) => {
            if(errorResponse[resCode] === undefined)
                resObj.status(resCode).send(res)
            else
                resObj.status(resCode).send(
                    Object.assign(errorResponse[resCode],res,{status : 'FAILED'}));
        }
    }
}

/*
-- add negative response here using response code as a key --
*/
let errorResponse = {
    404 : {error : 'Not Found'              },
    400 : {error : 'Bad Request'            },
    401 : {error : 'Unauthorized'           },
    409 : {error : 'Email Conflict'         },
    422 : {error : 'Unprocessable Entity'   },
    204 : {error: 'Required field missing'  }
}

/*
-- Available Methods --
setData()
send(res)  //pass 'res' object 


-- How to Use --

Sending Successful Response 
new Response(200).send(res);
        -OR-
new Response(200).setData(resData).send(res);


Sending unSuccessful response
new Response( 400 ).send(res);

*/