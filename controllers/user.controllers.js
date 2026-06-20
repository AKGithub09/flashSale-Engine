import { User } from '../models/user.models.js';;
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRY, NODE_ENV } from '../config/envConfig.js';
import mongoose from 'mongoose';
import { sendQStashEmail } from "../utils/qstash.utils.js";

// Registering a new User
const registerUser = async(req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try{
    const { username, email, password } = req.body;

    //If user already exists, return a error
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if(existingUser){
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({success: false, message: `User with this ${field} already exists!`});
    }

    //Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //expires in 10 minutes

    //Creating a new user
    const newUser = new User({
      username,
      email,
      password,
      otpCode,
      otpExpiry
    })

    //saving the new user to database
    await newUser.save({session});

    await sendQStashEmail(
      email,
      "FlashSale Engine - Verify Your Identity",
      `Welcome ${username}! Your 6-digit account activation verification code is: ${otpCode}. It expires in 10 minutes.`
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(
      {
        success: true,
        message: 'User has been created successfully in database, Please verify the OTP sent to your email to complete the registration process!'
      }
    );


  }catch(err){
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}


// Signing-in an existing user
const loginUser = async(req, res) => {
  try{
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({success: false, message: 'Invalid email or password'});
    }

    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
      return res.status(401).json({success: false, message: 'Invalid email or password'});
    }

    //login only for verified users
    if(!user.isVerified){
      return res.status(403).json({success: false, message: 'Please verify your email before logging in!'});
    }

    //generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY || '1d' });

    //set secure authentication cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 //1 day
    });
    
    return res.status(200).json({
      success: true,
      message: 'User logged-in successfully',
      user: {id: user._id, username: user.username, email: user.email}
    });


  }catch(err){
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
};


//logout user
const logoutUser = async(req, res) => {
  try{
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict'
    })
    return res.status(200).json({
      success: true,
      message: 'User logged-out successfully'
    })
  }catch(err){
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
};


// verify OTP and complete registration
const verifyOtp = async(req, res) => {
  try{
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if(!user){
      return res.status(400).json({sucess: false, message: 'Invalid user not found'});
    }

    if(user.isVerified){
      return res.status(400).json({sucess: false, message: 'User is already verified'});
    }

    //for incorrect or expired otp
    if(user.otpCode !== otpCode || user.otpExpiry < new Date()){
      return res.status(400).json({sucess: false, message: 'Invalid Otp or Otp has been expired'});
    }

    //Success: Flip verification status flags and clear OTP fields
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save({validateBeforeSave: false});

    return res.status(201).json({
      success: true,
      message: 'Email has been verified you can use flashSale now',
    });

  }catch(err){
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}

export { registerUser, loginUser, logoutUser, verifyOtp };