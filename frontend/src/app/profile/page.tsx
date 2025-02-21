"use client";

import { getGenres, updateUser } from "@/api/backendEndpoints";
import { Location } from "@/api/locationApi";
import FormField from "@/components/form/FormField";
import LocationInput from "@/components/form/LocationInput"; // Import the LocationInput component
import { MultiSelect } from "@/components/form/multi-select";
import Navbar from "@/components/nav/navbar";
import EditableImage from "@/components/other/EditableImage";
import { Button } from "@/components/ui/button";
import { User } from "@/models/user";
import useAuthStore from "@/store/authStore";
import { profileUpdateSchema, ProfileUpdateSchema } from "@/utils/user-schemas";
import { useUser } from "@auth0/nextjs-auth0";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Profile() {
  const { data } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });
  const { user: auth0User } = useUser(); // Fetch user data from Auth0
  const { user, setUser } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [genresData, setGenresData] = useState<any[]>([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(undefined);
  const [imageUrl, setImageUrl] = useState<string>();
  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: handleUpdateUser } = useMutation({
    mutationFn: async (data: ProfileUpdateSchema) => {
      setIsUpdating(true);
      if (!user || !auth0User?.sub) {
        setIsUpdating(false);
        throw new Error("User error");
      }

      const updatedUser = {
        id: user.id,
        name: data.username,
        username: data.username,
        phone: data.phoneNumber,
        email: data.email,
        auth0Sub: auth0User.sub || "",
        address: data.location || "",
        avatarUrl: data.imageUrl,
        seatingPreference: data.seatingPreference,
        smoking: data.smoking,
        talkative: data.talkative,
        preferredGenreIds: data.preferredGenreIds || [],
      };

      return updateUser(user.id, updatedUser);
    },
    onSuccess: (data: User) => {
      setUser(data);
      toast.success("User data updated successfully");
      setEditMode(false);
      setIsUpdating(false);
    },
    onError: (error: any) => {
      console.error("Error updating user data:", error);
      toast.error(error.message || "Error updating user data");
      setIsUpdating(false);
    },
  });

  const methods = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    setGenresData(data?._embedded?.genres || []);
  }, [data]);

  useEffect(() => {
    if (user) {
      methods.reset({
        username: user.username || "",
        phoneNumber: user.phone || "",
        email: user.email || "",
        imageUrl: user.avatarUrl || "",
        smoking: user.smoking || false,
        seatingPreference: user.seatingPreference || false,
        talkative: user.talkative || false,
        preferredGenreIds: user.preferredGenres?.map((g) => g.id) || [],
        location: user.address || "",
      });
      setSelectedLocation(
        user.address ? ({ address: user.address } as Location) : undefined
      );
      setImageUrl(user.avatarUrl);
    }
  }, [user, methods]);

  return (
    <>
      <Navbar />
      <div className="lg:ml-28 lg:mr-14 pt-24 pb-20">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data) => handleUpdateUser(data))}
          >
            <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
              <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
              <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
                <div className="flex flex-col md:flex-row justify-between items-center m-4">
                  <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-10">
                    <EditableImage
                      setImageUrl={(url) => {
                        setImageUrl(url);
                        methods.setValue("imageUrl", url);
                      }}
                      imageUrl={imageUrl}
                      username={methods.getValues("username")} // Pass the username prop
                      hideActions={!editMode || isUpdating}
                      muted={!editMode || isUpdating}
                      instantUpload
                      className="rounded-full w-40 h-40 mb-4 lg:mb-0"
                    />
                    <div className="flex flex-col text-center lg:text-left mb-4 lg:mb-0">
                      <div className="text-lg lg:text-xl font-bold">
                        {user?.username}
                      </div>
                      <div className="text-xs lg:text-base text-gray-500">
                        {auth0User?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {editMode ? (
                      <>
                        <Button
                          variant={"destructive"}
                          className="bg-primary-orange lg:h-10 lg:rounded-md lg:px-8"
                          type={"submit"}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Icon icon="line-md:loading-loop" /> Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          onClick={() => setEditMode(false)}
                          variant="default"
                          className={`lg:h-10 lg:rounded-md lg:px-8 ${
                            isUpdating && "hidden"
                          }`}
                          type="button"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditMode(true);
                        }}
                        className="lg:h-10 lg:rounded-md lg:px-8"
                        type="button"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-col p-4">
                    <div className="text-lg font-bold">User Information</div>
                    <div className="mt-2 lg:flex-row gap-4 lg:w-3/4 grid lg:grid-cols-3">
                      <div className="flex flex-col lg:col-span-3 max-w-sm">
                        <FormField
                          name="username"
                          label="Username"
                          placeholder="Enter username"
                          value={user?.username || "No username..."}
                          isValueLoading={!user}
                          isNotEdit={!editMode}
                          muted={isUpdating}
                        />
                      </div>
                      <div className="flex flex-col lg:col-span-3 max-w-sm">
                        <FormField
                          name="phoneNumber"
                          label="Phone Number"
                          placeholder="Enter phone number"
                          isValueLoading={!user}
                          value={user?.phone || "No phone provided"}
                          isNotEdit={!editMode}
                          muted={isUpdating}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col p-4">
                    <div className="text-lg font-bold">
                      Location Information
                    </div>
                    <div className="mt-2 lg:flex-row gap-4 max-w-sm">
                      <div className="flex flex-col lg:col-span-3">
                        <FormField
                          name="location"
                          label="Location"
                          type="custom"
                          value={user?.address || "No address"}
                          isNotEdit={!editMode || isUpdating}
                          isValueLoading={!user}
                        >
                          <LocationInput
                            placeholder="Enter address, zip, and city"
                            selectedLocation={selectedLocation}
                            onChange={(loc) => {
                              setSelectedLocation(loc);
                              methods.setValue("location", loc?.address);
                            }}
                            query={locationQuery}
                            setQuery={setLocationQuery}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col p-4">
                    <div className="text-lg font-bold">Preferences</div>
                    <div className="mt-2 lg:flex-row gap-4 lg:w-3/4 grid lg:grid-cols-3">
                      <div className="flex flex-col">
                        <FormField
                          name="smoking"
                          type="switch"
                          placeholder="Smoking"
                          muted={!editMode || isUpdating}
                          isValueLoading={!user}
                        />
                      </div>
                      <div className="flex flex-col">
                        <FormField
                          name="talkative"
                          type="switch"
                          placeholder="Talkative"
                          muted={!editMode || isUpdating}
                          isValueLoading={!user}
                        />
                      </div>
                      <div className="flex flex-col lg:col-span-2">
                        <FormField
                          name="selectedGenres"
                          label="Music Genres"
                          type="custom"
                          isValueLoading={!user}
                        >
                          <MultiSelect
                            options={genresData.map((genre) => ({
                              value: genre.id?.toString(),
                              label: genre.name,
                            }))}
                            onValueChange={(values: string[]) =>
                              methods.setValue(
                                "preferredGenreIds",
                                values.map((v) => +v)
                              )
                            }
                            defaultValue={methods
                              .getValues("preferredGenreIds")
                              ?.map((g) => g.toString())}
                            placeholder="Select genres"
                            maxCount={2}
                            disabled={!editMode || isUpdating}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
}
