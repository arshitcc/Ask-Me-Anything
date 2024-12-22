'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { IMessage } from '@/models/message.models'
import UserSettings from '@/components/switch'
import { Message } from '@/components/message'
import { User } from 'next-auth'
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user as User;  
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const username = user?.username;
  const router = useRouter();

  const [profileUrl, setProfileUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
  }, [username]);

  const handleCopyLink = useCallback(() => {
    setCopiedProfile(true);
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Copied',
      description: 'Profile link copied to clipboard',
      variant: 'default'
    });
    setTimeout(() => {
      setCopiedProfile(false);
    }, 2000);
  }, [profileUrl, setCopiedProfile, toast]);
  
  useEffect(() => {
    if (copiedProfile && user.username!== username) {
      router.replace(`/u/${username}`);
    }
  }, [copiedProfile, router, username]);

  const getMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/messages`);
      if (response.data.success) {
        setMessages(response.data.messages!);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session) return;
    getMessages();
  }, [session, getMessages]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profile-link" className="text-lg font-semibold">Profile Link</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input id="profile-link" value={profileUrl} readOnly className="flex-grow" />
              <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                {!copiedProfile ? <Copy className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {copiedProfile ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
          </div>

          <Separator />

          <UserSettings />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Messages</h2>
              <Button onClick={getMessages} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            {isLoading ? (
              <p className="text-center py-4">Loading messages...</p>
            ) : messages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((message, index) => (
                  <Message
                    key={message._id.toString() || index}
                    message={message}
                    getMessages={getMessages}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-4">No messages to display.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

