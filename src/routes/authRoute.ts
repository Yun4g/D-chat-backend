import { Router } from "express";
import { connectDB } from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/UserScehema.js";
import { uploadToCloud } from "../utils/cloudUpload.js";



const route = Router();






route.post('/signup', async (req, res) => {
    await connectDB();
       try {
           const { userName, email, password, avatarUrl } = req.body;

           if (!userName || !email || !password) {
               return res.status(400).json({ 
                   error: 'Username, email, and password are required'
               });
           }
           if (avatarUrl && typeof avatarUrl !== 'string') {
               return res.status(400).json({ 
                   error: 'Avatar URL must be a valid string'
               });
           }

           const existingUser = await UserModel.findOne({ email });
           if (existingUser) {
             return  res.status(400).send('user with the given Email already exist')
         }
         
         let CloudImage = null;
         if (avatarUrl) {
             CloudImage = await uploadToCloud(avatarUrl);
             if (!CloudImage) {
                 return res.status(400).json({
                     error: 'Failed to upload avatar image. '
                 });
             }
         }

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         const newUser = await UserModel.create({
             userName: userName,
             email: email,
             password: hashedPassword,
             avatarUrl: CloudImage,
         })

           const { password: _, ...userData } = newUser.toObject();

        return   res.status(201).json({
               message: 'User Created Successfully',
               User: userData ,
           })
           

       } catch (error) {
          console.log(error)
         return   res.status(500).send(`an error occured ${error}`)
          
       }
});

 
route.post('/login', async (req, res) => {
  await connectDB();
  try {
    const { userName, email, password } = req.body;
     if (!userName || !email || !password) {
       return  res.status(400).send(' username, email , password  are required')
    }
    
    const existingAccount = await UserModel.findOne({ email });
    if (!existingAccount) {
       return res.status(404).send(' user with the giving email does not exist ')
    }

    const isPasswordValid = await bcrypt.compare(password, existingAccount.password);
    if (!isPasswordValid) {
       return res.status(400).send(' invalid credentials ')
    }

    const token = jwt.sign(
      { id: existingAccount._id, email: existingAccount.email },
        process.env.JWT_SECRET  as string,
        { expiresIn: '1d' }
    )

    const { password: _, ...userData } = existingAccount.toObject();

    return res.status(200).json({
      status: "success",
      user:  userData,
      token: token,
    })

  } catch (error) {
        console.log(error)
      return   res.status(500).send(`an error occured ${error}`)
       
  }
}) 




export default route;