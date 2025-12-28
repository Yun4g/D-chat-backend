import { Router, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../model/UserScehema.js";
import { uploadToCloud } from "../utils/cloudUpload.js";
import upload from "../middleware/mutler.js";
import { sendForgotPassWordEmail } from "../utils/sendEmail.js";



const route = Router();



// signup
route.post('/signup', upload.single('avatarUrl'), async (req, res) => {
  
  try {
    const { userName, email, password,  } = req.body;
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!userName || !email || !password) {
      return res.status(400).json({
        error: 'userName, email, and password are required'
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send('user with the given Email already exist')
    }
    let CloudImage = null;
    if (file) {
      try {
        const base64 = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64}`;
        CloudImage = await uploadToCloud(dataUri);
      } catch (err) {
        console.log('file upload error', err);
        return res.status(400).json({ error: 'Failed to upload avatar image.' });
      }
      if (!CloudImage) {
        return res.status(400).json({ error: 'Failed to upload avatar image.' });
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

    return res.status(201).json({
      message: 'User Created Successfully',
      User: userData,
    })

  } catch (error) {
    console.log(error)
    return res.status(500).send(`an error occured ${error} ` || 'Internal Server Error')

  }
});





// login
route.post('/login', async (req, res, next) => {

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send(' email , password  are required')
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
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    const { password: _, ...userData } = existingAccount.toObject();

    return res.status(200).json({ status: "success", user: userData, token: token });

  } catch (error) {
    console.log(error)
    next(error);
  }
})



route.post('/forgot-password', async (req, res) => {

  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send('User with the given email does not exist');
    }
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 1 hour.</p>   
      `
    await sendForgotPassWordEmail(email, 'Password Reset Request', message);
    console.log('Password reset email sent to:', email);
   return res.status(200).send('Password reset email sent successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send("server error  " + error);
  }

})



route.post('/reset-password/:token', async (req, res) => {
  

  try {
    const { email, newPassword } = req.body;
    const { token } = req.params;
    console.log(token);

    if (!token) {
      return res.status(401).send('Invalid or missing reset token');
    }
    if (!email || !newPassword) {
      return res.status(400).send('Email and new password are required');
    }
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).send('User with the given email does not exist');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).send('Password updated successfully');
  } catch (error) {
    console.log(error);
    return res.status(500).send(`An error occurred: ${error}`);
  }
});





export default route;