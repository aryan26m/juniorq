import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
  avatar?: string;
  bio?: string;
  codingProfiles?: {
    leetcode?: string;
    hackerrank?: string;
    codechef?: string;
  };
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getResetPasswordToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: 'default.jpg',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    codingProfiles: {
      leetcode: String,
      hackerrank: String,
      codechef: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
