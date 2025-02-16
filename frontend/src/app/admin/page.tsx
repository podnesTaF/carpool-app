import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminHome() {
  return (
    <>
      <div className="lg:ml-28 lg:mr-14 pt-24">
        <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
          <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
          <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
            <div className="p-5 flex flex-col">
              <p className="text-xl font-semibold text-black lg:text-3xl">
                Admin
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 pt-5">
                <div className="flex flex-col bg-white rounded-lg shadow-lg p-5">
                  <p className="text-lg font-semibold text-black">
                    Manage Events
                  </p>
                  <p className="text-sm">
                    Manage all Axxes events. Add, Update, Remove, Delete
                  </p>
                  <Link
                    href="/admin/events"
                    className="w-full flex justify-end items-center"
                  >
                    <Button className="flex gap-4 items-center justify-center text-white py-3 px-6 transition duration-300 ease-in-out shadow-lg">
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
