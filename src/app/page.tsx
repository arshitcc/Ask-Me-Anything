"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageCircle, Shield, Zap } from "lucide-react"; // Assuming you have an icon for messages
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "../messages.json";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 bg-grid-gray-700/20 bg-[size:20px_20px]"
          style={{
            maskImage: "radial-gradient(gray, transparent)",
            WebkitMaskImage: "radial-gradient(gray, transparent)",
          }}
        ></div>
        <div className="relative container mx-auto px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
              <div>
                <h2 className="text-3xl font-bold text-gray-100 sm:text-4xl mb-2">
                  Ask-Me-Anything
                </h2>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl xl:text-7xl">
                  Honest Feedback,{" "}
                  <span className="text-blue-400">Anonymously</span>
                </h1>
              </div>
              <p className="mx-auto max-w-2xl text-lg text-gray-300 lg:mx-0 xl:text-xl">
                Ask-Me-Anything is a revolutionary platform designed to foster
                open, honest communication by enabling users to send and receive
                anonymous messages.
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Signup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-blue-500 sm:w-auto border-gray-600  hover:bg-gray-500"
                  >
                    Login
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { Icon: Shield, text: "100% Anonymous" },
                  { Icon: MessageCircle, text: "Honest Insights" },
                  { Icon: Zap, text: "Drive Change" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center space-x-2 rounded-lg bg-gray-800 p-3 border border-gray-700"
                  >
                    <feature.Icon className="h-6 w-6 text-blue-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Carousel
                plugins={[Autoplay({ delay: 3000 })]}
                className="w-full max-w-lg"
              >
                <CarouselContent className="w-full">
                  {messages.map((message, index) => (
                    <CarouselItem key={index} className="p-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>{message.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                          <Mail className="flex-shrink-0" />
                          <div>
                            <p>{message.content}</p>
                            <p className="text-xs text-muted-foreground">
                              {message.received}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
        <Link href="https://github.com/arshitcc">
          <footer className=" hover:text-cyan-400 absolute bottom-0 left-0 right-0 text-center py-4 text-gray-400 text-sm">
            Created with Patience By <p>@Arshit🔥</p>
          </footer>
        </Link>
      </div>
    </>
  );
}
