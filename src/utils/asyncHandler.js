//We can use async handler of try/catch or promises


//Using promises

const asyncHandler = (requestHandler) =>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}

//Higher order functions
// const asyncHandler =() =>{}
// const asyncHandler =(fn) => () => {}
// const asyncHandler =(func) => async () =>{}

//Using try/catch
// const asyncHandler = (func) => async(req,res,next) =>{
//     try{
//         await func(req,res,next)
//     }
//     catch(err){
//         res.send(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }