"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Copy, Check, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import * as z from "zod";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { messageSchema } from "@/schemas/message.schema";
import { ApiResponse } from "@/types/ApiResponse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "next-auth";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar).map((msg) => msg.trim());
};

export default function SendMessage() {
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [MessageLoading, setMessageLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as User;

  const params = useParams<{ username: string }>();
  const username = params.username;

  useEffect(() => {
    if (status === "authenticated" && user.username === username) {
      router.replace("/dashboard");
    }
  }, [status, user, router]);  

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/messages", {
        username,
        message: data.content,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestedMessages = async () => {
    try {
      setMessageLoading(true);
      const response = await axios.post<ApiResponse>("/api/suggest-messages");
      const messages = parseStringMessages(response.data.message);
      setAiMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        description: "Error While Suggesting Message",
        variant: "destructive",
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const copyToClipboard = (message: string, index: number) => {
    navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    toast({
      title: "Copied to clipboard",
      description: "Message has been copied to your clipboard",
      variant: "default",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Send Message to @{username}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Your Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your anonymous message here"
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center gap-4">
                  {status === "authenticated" ? (
                    <Button
                      type="submit"
                      disabled={isLoading || !messageContent}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={() => router.replace("/login")}
                    >
                      Login to send message
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <Separator />

            <div>
              <Button
                onClick={getSuggestedMessages}
                type="button"
                variant="outline"
                disabled={MessageLoading}
                className="w-full sm:w-auto"
              >
                {MessageLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                )}
                Suggest Messages
              </Button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Suggested Messages</h2>
              {MessageLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : aiMessages.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {aiMessages.map((message, index) => (
                    <Card
                      key={index}
                      className="group hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm flex-grow">{message}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(message, index)}
                            className="opacity-100 transition-opacity"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Click &quot;Suggest Messages&quot; to get message
                    suggestions
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
