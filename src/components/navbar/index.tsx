"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "../ui/button";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="bg-gray-900 p-4 text-white shadow-md md:p-6">
      <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
        <Link href="/" className="mb-4 text-xl font-bold md:mb-0">
          Ask Me Anything
        </Link>
        {session ? (
          <div className="flex flex-row items-center gap-4">
            <span className="mr-4">Welcome, {user.username || user.email}</span>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full text-black md:w-auto">
                Dashboard
              </Button>
            </Link>
            <Button onClick={() => signOut()} className="w-full text-black md:w-auto" variant="destructive">
              Log Out
            </Button>
            
          </div>
        ) : (
          <Link href="/login">
            <Button className="w-full bg-slate-100 text-black md:w-auto" variant={'outline'}>
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
