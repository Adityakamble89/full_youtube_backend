const asyncHandler = (requestHandlerfun) => {
    return (req, res, next) => {
        Promise.resolve(requestHandlerfun(req, res, next)).catch((err) => next(err))
    }
}

export default asyncHandler

// const asyncHandler_using_try_catch = (fun) =>{
//    async (req,res,next)=>{
//         try{
//             await fun(req , res , next)
//         }catch(e){
//             error
//         }
//     }
// }