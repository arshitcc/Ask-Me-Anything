"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/schemas/login.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import React from "react";

const page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        user: data.user,
        password: data.password,
      });

      if (response?.error) {
        if (response.error === "CredentialsSignin") {
          toast({
            title: "Login Failed",
            description: "Incorrect username or password",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login successful",
          variant: "default",
        });
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Error logging in", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 p-2">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join <br />
            Ask-Me-Anything
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input placeholder="Username" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder="Password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="text-center mt-4">
            <p>
              Not a member?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default page;
