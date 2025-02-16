"use client";

import useStore from "@/store/store"; // Import your Zustand store
import { deleteEvent, getEvent, postEvent, updateEvent } from "@/api/event";
import { Location } from "@/api/locationApi";
import { notifyEveryoneNewEvent } from "@/api/notification";
import FormField from "@/components/form/FormField";
import LocationInput from "@/components/form/LocationInput";
import EditableImage from "@/components/other/EditableImage";
import TooltipButton from "@/components/other/TooltipButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  eventCreationSchema,
  EventCreationSchema,
} from "@/utils/event-register-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

function AdminEventsCreateContent() {
  const { resetProgress } = useStore();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(undefined);
  const [addressQuery, setAddressQuery] = useState<string>("");
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const {
    data: event,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(+eventId!),
    enabled: !!eventId,
  });

  const methods = useForm<EventCreationSchema>({
    resolver: zodResolver(eventCreationSchema),
  });

  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: (data: EventCreationSchema) => postEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/admin/events");
    },
    onError: (error) => {
      toast.error(error.message || "error creating the event");
    },
  });

  const { mutate: handleDeleteEvent, isPending: isDeletePending } = useMutation(
    {
      mutationFn: (id: number) => deleteEvent(id),
      onSuccess: () => {
        toast.success("Event deleted successfully");
        router.push("/admin/events");
      },
      onError: (e) => {
        toast.error(e.message || "Error deleting the event");
        console.log("Error deleting event", e);
      },
    }
  );

  const { mutate: handleUpdateEvent, isPending: isEditPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventCreationSchema }) =>
      updateEvent(id, data),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success(`Event successfully updated`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating event: ` + error.message);
      console.log(`Error updating event: ${error}`);
    },
  });

  useEffect(() => {
    if (event) {
      methods.reset({ ...event } as EventCreationSchema);
      setSelectedLocation(
        event.address ? ({ address: event.address } as Location) : undefined
      );
      setImageUrl(event.bannerUrl);
    }
  }, [event, methods]);

  useEffect(() => {
    resetProgress();
  }, [resetProgress]);

  const customImageActions = ({
    selectedFile,
    isUploading,
    handleSaveClick,
    handleEditClick,
  }: {
    selectedFile: File | null;
    isUploading: boolean;
    isDeleting: boolean;
    handleSaveClick: () => void;
    handleEditClick: () => void;
    handleDeleteClick: () => void;
  }) => (
    <div className="absolute top-3 left-3 flex gap-2">
      {selectedFile && !isUploading ? (
        <Button type="button" onClick={handleSaveClick} variant={"ghost"}>
          <Check className="text-primary-orange" />
        </Button>
      ) : (
        <Button type="button" onClick={handleEditClick} variant={"ghost"}>
          <Edit className="text-primary-orange" />
        </Button>
      )}
    </div>
  );

  const setLocation = (location?: Location) => {
    setSelectedLocation(location);
    methods.setValue("address", location?.address || "");
    if (!location) {
      methods.resetField("latitude");
      methods.resetField("longitude");
    } else {
      methods.setValue("latitude", location.lat);
      methods.setValue("longitude", location.lng);
    }
  };

  console.log(methods.formState.isDirty, methods.formState.errors);
  if (!searchParams) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="lg:ml-28 lg:mr-14 pt-24">
        <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
          <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
          <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
            {isPending ? (
              <div className="h-full bg-primary-white rounded-lg p-5 m-5">
                <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                  <Icon icon={"mdi:loading"} className="animate-spin" />
                  Creating event...
                </p>
              </div>
            ) : isLoading ? (
              <div className="h-full bg-primary-white rounded-lg p-5 m-5">
                <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                  Loading event...
                </p>
              </div>
            ) : (
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit((data) => createEvent(data))}
                  className="p-5 flex flex-col"
                >
                  <div className="text-xl lg:text-3xl text-black font-semibold flex justify-between items-center">
                    {eventId ? (
                      <>
                        <div className="flex flex-col">
                          <span>Edit: {event?.title}</span>
                          {event?.archived && (
                            <span className="text-sm text-destructive">
                              [Archived]
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>Create a new event</>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={"/admin/events"}>
                          <Button variant={"default"}>
                            <Icon icon={"mdi:arrow-left"} />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-white text-xs">
                          Cancel and back to overview
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-full h-full bg-primary-white rounded-lg p-5 mt-5 shadow-lg flex flex-col gap-5">
                    {eventId ? (
                      <div className="flex justify-between lg:justify-end gap-5">
                        <Dialog
                          open={deleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <TooltipButton
                              tooltip="Delete Event"
                              tooltipClass="bg-red-800/80"
                              buttonProps={{
                                className:
                                  "bg-destructive hover:bg-destructive/80",
                                type: "button",
                                disabled: isDeletePending || isEditPending,
                                onClick: () => {
                                  setDeleteDialogOpen(true);
                                },
                              }}
                              icon={<Icon icon={"mdi:bin"} />}
                            />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this event? This
                              action cannot be undone.
                            </DialogDescription>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                disabled={isDeletePending}
                                onClick={() => {
                                  if (eventId) handleDeleteEvent(+eventId);
                                }}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <TooltipButton
                          tooltip="Archive event"
                          tooltipClass="bg-orange-500/80"
                          buttonProps={{
                            className: "bg-orange-500 hover:bg-orange-500/80",
                            type: "button",
                            disabled: isDeletePending || isEditPending,
                            onClick: () => {
                              methods.setValue(
                                "archived",
                                !methods.getValues("archived")
                              );
                              console.log("working");
                              methods.handleSubmit((data) =>
                                handleUpdateEvent({ id: +eventId, data })
                              )();
                            },
                          }}
                          icon={<Icon icon={"mdi:archive"} />}
                        />

                        <TooltipButton
                          tooltip="Save event"
                          tooltipClass="bg-green-500/80"
                          buttonProps={{
                            className: "bg-green-500 hover:bg-green-500/80",
                            disabled: isDeletePending || isEditPending,
                            type: "button",
                            onClick: () => {
                              methods.handleSubmit((data) =>
                                handleUpdateEvent({ id: +eventId, data })
                              )();
                            },
                          }}
                          icon={<Icon icon={"material-symbols:save"} />}
                        />
                        <Dialog
                          open={notifyDialogOpen}
                          onOpenChange={setNotifyDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <TooltipButton
                              tooltip="Notify users about event"
                              tooltipClass="bg-secondary/80"
                              buttonProps={{
                                className: "bg-secondary hover:bg-secondary/80",
                                type: "button",
                                onClick: () => {
                                  methods.handleSubmit(() =>
                                    setNotifyDialogOpen(true)
                                  )();
                                },
                              }}
                              icon={
                                <Icon
                                  icon="solar:bell-bing-outline"
                                  className="transition w-full h-full"
                                  width="24"
                                  height="24"
                                />
                              }
                            />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Confirm Notify</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to notify all users about
                              this new event? This action cannot be undone.
                            </DialogDescription>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (eventId) {
                                    setNotifyDialogOpen(false);
                                    notifyEveryoneNewEvent(+eventId);
                                  }
                                }}
                              >
                                Notify Everyone
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <TooltipButton
                          tooltip="Save event"
                          tooltipClass="bg-green-500/80 mb-2"
                          buttonProps={{
                            type: "submit",
                            className: "bg-green-500 hover:bg-green-500/80",
                          }}
                          icon={<Icon icon={"material-symbols:save"} />}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="w-full h-full flex flex-col gap-5">
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name={"title"}
                            placeholder="Event title..."
                            label="Title"
                          />
                        </div>
                        <div className="w-full items-center gap-1.5 max-w-full">
                          <FormField
                            name={"address"}
                            label="Address"
                            type="custom"
                          >
                            <div
                              className={`truncate w-full${
                                location ? "" : "text-gray-500"
                              }`}
                            >
                              <LocationInput
                                placeholder="Enter address..."
                                onChange={(p) => setLocation(p)}
                                selectedLocation={selectedLocation}
                                query={addressQuery}
                                setQuery={setAddressQuery}
                              />
                            </div>
                          </FormField>
                        </div>
                        <div className="flex flex-col flex-wrap xl:flex-nowrap lg:flex-row justify-between items-center gap-2">
                          <div className="w-full items-center gap-1.5">
                            <FormField
                              name={"startDateTime"}
                              placeholder="Start time..."
                              label="Start Date & Time"
                              inputType="datetime-local"
                            />
                          </div>
                          <div className="w-full items-center gap-1.5">
                            <FormField
                              name={"endDateTime"}
                              placeholder="End time..."
                              label="End Date & Time"
                              inputType="datetime-local"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-full flex flex-col gap-3">
                        <div className="flex flex-col items-center justify-between w-full">
                          <div className="flex items-center gap-2 flex-col lg:flex-row w-full">
                            <div className="flex flex-col w-full gap-1.5">
                              <FormField
                                type="custom"
                                name={"bannerUrl"}
                                label="Banner Image"
                              >
                                <EditableImage
                                  setImageUrl={(url) => {
                                    setImageUrl(url);
                                    methods.setValue("bannerUrl", url);
                                  }}
                                  imageUrl={imageUrl}
                                  instantUpload
                                  className="w-full h-32"
                                  borderRadiusClass="rounded-lg"
                                  placeholderText="Click to upload an event banner"
                                  renderActions={customImageActions}
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex flex-grow flex-col gap-1.5">
                          <FormField
                            name={"description"}
                            type="textarea"
                            placeholder="Event description.."
                            label="Description"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminEventsCreate() {
  const { progress, setProgress } = useStore();
  useEffect(() => {
    let progressValue = 0;

    // Use setInterval to update progress smoothly
    const interval = setInterval(() => {
      progressValue += 20;
      setProgress(progressValue);
      if (progressValue >= 100) {
        clearInterval(interval);

        // Use setTimeout to delay the redirect after the progress bar completes
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval); // Clear the interval when component is unmounted
  }, [setProgress]);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center items-center p-6">
          <Image
            src="/logo.png"
            priority={true}
            alt="Axxes Logo"
            width={250}
            height={200}
            className="mb-5"
          />
          <Progress value={progress} className="w-64 h-2" />
        </div>
      }
    >
      <AdminEventsCreateContent />
    </Suspense>
  );
}
