import WithPageAuthRequired from "@/components/hok/withPageAuthRequired";
import Navbar from "@/components/nav/navbar";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      {children}
    </div>
  );
};

export default WithPageAuthRequired(Layout);
