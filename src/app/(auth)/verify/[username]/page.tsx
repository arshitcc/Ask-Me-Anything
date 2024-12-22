"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ApiResponse } from "@/types/ApiResponse";
import { verifySchema } from "@/schemas/verify.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { username } = useParams();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (data: z.infer<typeof verifySchema>) => {
    if (data.code.length >= 6) {
      setVerifying(true);
      try {
        const response = await axios.post<ApiResponse>("/api/verify", {
          username,
          verifyCode: data.code,
        });
        if (response.data.success) {
          toast({
            title: response.data.message,
            variant: "default",
          });
          router.replace("/login");
        } else {
          toast({
            title: response.data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Verification Failed",
          description: axiosError.response?.data.message,
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    }
  };

  return (
    <div className="flex justify-center bg-gray-900 items-center min-h-screen p-2">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleVerify)}
            className="space-y-6"
          >
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={verifying}>
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
