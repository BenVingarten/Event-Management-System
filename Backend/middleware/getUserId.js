import { ObjectId } from "mongodb";

export const getUserId = (req, res, next) => {
    if(!req?.params?.id)
        return res.status(400).json({error: "user id is missing in the request"});

    const id = req.params.id;

    if(!ObjectId.isValid(id))  
        return res.status(400).json({error: "user id is not valid"});
    
    req.userId = id;
    next();
 }
