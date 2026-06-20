import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username:{
      type: String,
      required: true,
      unique: true,
      validate:{
        validator: function(v){
          return v.length >= 4 && v.length <= 20 && !v.includes(' ');
        },
        message: props => `${props.value} is not a valid username!, Please try again`
      }
    },
    email:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate:{
        validator: function(v){
          return v.length >= 5 && v.includes('@');
        },
        message: props => `${props.value} is not a valid email!, Please try again`
      }
    },
    password:{
      type: String,
      required: true,
      validate:{
        validator: function(v){
          return v.length >= 8 && v.length <= 20 && !v.includes(' ');
        },
        message: props => `${props.value} is not a valid password!, Please try again`
      }
    },
    isVerified:{
      type: Boolean,
      default: false
    },
    otpCode:{
      type: String
    },
    otpExpiry:{
      type: Date
    }
  },{
    timestamps: true
  }
)


//pre-save hook used for hashing the password before saving the user to the database
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return ;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
})


//method for comparing typed passwords with stored ones
userSchema.methods.comparePassword = async function(typedPassword){
  return await bcrypt.compare(typedPassword, this.password);
}

export const User = mongoose.model('User', userSchema);