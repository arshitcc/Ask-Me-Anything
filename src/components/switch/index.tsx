"use client";

import { AcceptMessageSchema } from "@/schemas/acceptMessage.schema";
import React, { useCallback, useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useSession } from "next-auth/react";

const UserSettings = () => {
  const [isSwitching, setIsSwitching] = useState(false);
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });
  const { register, setValue, watch } = form;
  const { toast } = useToast();

  const handleSwitchChange = async () => {
    setIsSwitching(true);
    try {
      const { data } = await axios.patch<ApiResponse>("/api/toggle-accept-messages",{isAcceptingMessages: !watch("acceptMessages")}); 
      if (data.success) {
        if (data.isAcceptingMessages) {
          toast({
            title: "Accepting Messages",
            variant: "default",
          });
        }
        else{
          toast({
            title: "Not Accepting Messages",
            variant: "destructive",
          });
        }
        
        setValue("acceptMessages", !watch("acceptMessages")!);
      } else {
        toast({
          title: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const getAcceptingMessagesStatus = useCallback(async () => {
    setIsSwitching(true);
    try {
      const response = await axios.get<ApiResponse>(
        "/api/toggle-accept-messages"
      );
      setValue("acceptMessages", response.data.isAcceptingMessages!);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (!session) return;
    getAcceptingMessagesStatus();
  }, [session, setValue, getAcceptingMessagesStatus]);

  return (
    <>
      <div className="mb-4 flex items-center">
        <Switch
          {...register("acceptMessages")}
          checked={watch("acceptMessages")}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitching}
        />
        <span className="ml-2">
          Accept Messages: { watch("acceptMessages") ? "On" : "Off"}
        </span>
      </div>
      <Separator />
    </>
  );
};

export default UserSettings;
