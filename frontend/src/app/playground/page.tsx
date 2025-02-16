'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import the Label component
import { useState } from "react";



export default function PlayGroundPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Test Components</h1>

      <h3 className="text-3xl font-semibold text-gray-800 mb-6"> Input & Text</h3>

      <div className="relative mb-4 w-full max-w-lg">
        <Input
          className="w-full pl-12 pr-4 py-3 pb-5 pt-5 text-lg bg-white shadow-lg text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition"
          placeholder="Search for an event"
        />
      </div>



      <Textarea className="mb-4" placeholder="Write something..." />

      <h3 className="text-3xl font-semibold text-gray-800 mb-6"> Buttons</h3>

      <div className="flex space-x-4 mb-8">
        <Button>Standard</Button>
        <Button className="bg-primary-orange rounded-2xl">click me</Button>
        <Button className="bg-secondary rounded-2xl">click me</Button>
        <Button className="bg-primary-orange rounded-2xl">Open route in maps <Icon icon="ion:navigate-circle" style={{ width: '25px', height: '25px' }} /></Button>
      </div>

      <h3 className="text-3xl font-semibold text-gray-800 mb-6"> Cards</h3>

      <div
        className="relative mt-8 max-w-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Single Card */}
        <Card
          className={`relative bg-primary transition-all duration-500 transform ${isHovered
            ? "rounded-t-3xl rounded-l-3xl rounded-br-3xl rounded-bl-none scale-100 shadow-xl"
            : "rounded-t-3xl rounded-l-3xl rounded-br-3xl rounded-bl-none scale-95 shadow-md"
            }`}
        >
          <CardHeader
            className={`${isHovered ? "p-4" : "flex flex-col items-center justify-center h-full"
              }`}
          >
            <div className={`flex ${isHovered ? "space-x-2" : "space-x-1"}`}>
              <Label
                className={`${isHovered
                  ? "bg-primary-orange text-white rounded-2xl px-4 py-2"
                  : "bg-primary-orange text-white rounded-full px-2 py-1 text-sm"
                  }`}
              >
                Sport
              </Label>
              <Label
                className={`${isHovered
                  ? "bg-secondary text-white rounded-2xl px-4 py-2"
                  : "bg-secondary text-white rounded-full px-2 py-1 text-sm"
                  }`}
              >

                Skies
              </Label>

            </div>
            <CardDescription
              className={`text-white ${isHovered ? "mb-0" : "text-xs mt-2"
                }`}
            >
              12.12.2024
            </CardDescription>
          </CardHeader>
          {isHovered && (
            <>
              <p className="text-white px-6">
                <b>Skies teambuilding Antwerp</b>
              </p>
              <CardFooter>
                <p className="text-primary-orange underline px-6">
                  Read More & Register
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>





      {/* AlertDialog Component */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="bg-red-500">Open Alert Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reverse the quest?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Wrap buttons in AlertDialogAction to close the dialog */}
            <AlertDialogAction asChild>
              <Button className="bg-primary">Cancel</Button>
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Button className="bg-primary-orange hover:bg-orange-500">Confirm</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-24" />


      {/* TABS Component */}
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>

    </div>
  );
}
