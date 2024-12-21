import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models/users.model";
import bcrypt from "bcrypt";

export const AuthOptions: NextAuthOptions ={
    providers: [
        CredentialsProvider({
            id : "credentials",
            name : "Credentials",   
            credentials : {
                user : {
                    label : "Username or Email",
                    type : "text",
                    placeholder : "Enter username or email"
                },
                password : {
                    label : "Password",
                    type : "password",
                    placeholder : "Enter password"
                }
            },
            async authorize(credentials : any) : Promise<any>{
                await connectDB();
                try {
                    const user = await User.findOne({
                        $or : [{username : credentials.user}, {email : credentials.user}]
                    });
                    if(!user){
                        throw new Error("User doesn't exist");
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password,user.password);
                    if(isPasswordCorrect){
                        return user;
                    }
                    else{
                        throw new Error("Incorrect password");
                    }
                } catch (error : any) {
                    throw new Error(error.message);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if(user){
                token._id = user._id;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
}