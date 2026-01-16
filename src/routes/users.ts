import { AuthRequest } from './../middleware/authMiddleware';
import { Response, Router } from "express";
import { UserModel } from "../model/UserScehema";



const route = Router();

// hyration endpoint

route.get("/me", async (req: AuthRequest, res:Response) => {
      const userId = req.userId;
      if(!userId) return res.status(400).json({message: "usersId not found"})

       try {
            const getUserDetals = await UserModel.findOne({_id: userId});
            if(!getUserDetals) {
                return res.status(404).json({message:"cannot find userDetails"})
            }

            return res.status(200).json(getUserDetals)
       } catch (error) {
          return res.status(500).json({message: "internal server error"})
       }
})

export default route;