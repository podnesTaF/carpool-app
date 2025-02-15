"use client";

import {
  createVehicle,
  deleteVehicle,
  getUserVehicles,
  updateVehicle,
} from "@/api/vehicles";
import ColorSelect from "@/components/form/colorSelect";
import FormField from "@/components/form/FormField";
import VehicleDetails from "@/components/form/vehicleDetails";
import Navbar from "@/components/nav/navbar";
import EditableImage from "@/components/other/EditableImage";
import TooltipButton from "@/components/other/TooltipButton";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/models/vehicle";
import useAuthStore from "@/store/authStore";
import {
  vehicleCreateSchema,
  VehicleCreateSchema,
  VehicleEditSchema,
} from "@/utils/car-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Edit } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Cars() {
  const [addMode, setAddMode] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { user } = useAuthStore();

  const {
    data: userVehicles,
    isLoading: vehiclesLoading,
    refetch,
    isRefetching: vehiclesRefetching,
  } = useQuery({
    queryKey: ["vehicles", user?.id],
    queryFn: () => {
      return getUserVehicles(user!.id);
    },
    enabled: !!user?.id,
  });

  const { mutate: deleteCar, isPending: deleteLoading } = useMutation({
    mutationFn: (vehicleId: number) => deleteVehicle(vehicleId),
    onSuccess: () => {
      setAddMode(false);
      toast.success("Vehicle deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Error deleting the vehicle");
    },
  });

  const { mutate: addCar, isPending: addPending } = useMutation({
    mutationFn: (data: VehicleCreateSchema) =>
      createVehicle({
        ...data,
        user: `/users/${user?.id}`,
        imgUrl: data.imageUrl,
      } as Partial<Vehicle>),
    onSuccess: () => {
      createFormMethods.reset();
      setImageUrl("");
      toast.success("Vehicle created successfully");
      setAddMode(false);
      refetch();
    },
  });

  const { mutate: editCar, isPending: editPending } = useMutation({
    mutationFn: ({
      data,
      vehicle,
      imageUrl,
    }: {
      data: VehicleEditSchema;
      vehicle: Vehicle;
      imageUrl?: string;
    }) =>
      updateVehicle(vehicle.id, {
        ...data,
        user: `/users/${user?.id}`,
        imgUrl: imageUrl,
      }),
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      createFormMethods.reset();
      setImageUrl("");
      refetch();
      setEditMode(null);
    },
    onError: (error) => {
      toast.error(error.message || "error editing the car");
    },
  });

  const createFormMethods = useForm<VehicleCreateSchema>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      brand: "",
      model: "",
      color: "",
      plate: "",
      maxPassengers: 1,
      imageUrl: "",
    },
  });

  const errors = createFormMethods.formState.errors;
  const { setValue } = createFormMethods;

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
  }) =>
    editMode || addMode ? (
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
    ) : null;

  const handleAddMode = () => {
    setAddMode(true);
    setTimeout(() => {
      document
        .getElementById("addMode")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  return (
    <>
      <Navbar />
      <div className="lg:ml-28 lg:mr-14 pt-24">
        <div className="flex flex-col items-center justify-center w-full h-full px-2 lg:px-0">
          <div className="flex flex-col w-full h-10 lg:h-20 rounded-t-2xl bg-gradient-to-r from-primary to-secondary-medium"></div>
          <div className="flex flex-col w-full bg-gray-100 rounded-b-2xl lg:px-5">
            <div className="p-5 flex flex-col">
              <div className="flex justify-between items-center gap-5 mb-5">
                <p className="text-xl font-semibold text-black lg:text-3xl">
                  Vehicles
                </p>
                <TooltipButton
                  tooltip="Add Vehicle"
                  tooltipClass="bg-orange-500/80"
                  buttonProps={{
                    type: "button",
                    className: "bg-primary-orange hover:bg-orange-600/80",
                    onClick: handleAddMode,
                  }}
                  icon={<Icon icon={"uil:plus"} />}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {(vehiclesLoading || vehiclesRefetching) && (
                  <div className="h-max bg-primary-white rounded-2xl p-5">
                    <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                      <Icon icon={"mdi:loading"} className="animate-spin" />
                      Loading vehicles...
                    </p>
                  </div>
                )}
                {!addMode &&
                  userVehicles &&
                  !vehiclesLoading &&
                  !vehiclesRefetching &&
                  userVehicles.length === 0 && (
                    <div className="h-max bg-primary-white rounded-2xl p-5">
                      <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                        No vehicles...
                      </p>
                    </div>
                  )}
                {userVehicles &&
                  !vehiclesLoading &&
                  !vehiclesRefetching &&
                  userVehicles.length > 0 &&
                  userVehicles.map((vehicle: Vehicle) =>
                    editMode === vehicle.id && deleteLoading ? (
                      <div
                        key={`deleteLoading-${vehicle.id}`}
                        className="h-max bg-primary-white rounded-2xl p-5"
                      >
                        <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                          <Icon icon={"mdi:loading"} className="animate-spin" />
                          Deleting vehicle...
                        </p>
                      </div>
                    ) : editMode === vehicle.id && editPending ? (
                      <div
                        key={`editLoading-${vehicle.id}`}
                        className="h-max bg-primary-white rounded-2xl p-5"
                      >
                        <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                          <Icon icon={"mdi:loading"} className="animate-spin" />
                          Updating vehicle...
                        </p>
                      </div>
                    ) : (
                      <VehicleDetails
                        key={vehicle.id}
                        vehicle={vehicle}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        onSubmitEdit={editCar}
                        handleDelete={deleteCar}
                      />
                    )
                  )}
                {addPending && (
                  <div className="h-max bg-primary-white rounded-2xl p-5">
                    <p className="text-lg text-gray-600 flex gap-2 justify-start items-center">
                      <Icon icon={"mdi:loading"} className="animate-spin" />
                      Creating vehicle...
                    </p>
                  </div>
                )}
                {addMode && !addPending && (
                  <FormProvider {...createFormMethods}>
                    <form
                      onSubmit={createFormMethods.handleSubmit((data) =>
                        addCar(data)
                      )}
                      className="flex flex-col gap-5 w-full bg-primary-white rounded-2xl p-5"
                      id="addMode"
                    >
                      <div className="flex w-full justify-between items-center gap-5">
                        <TooltipButton
                          tooltip="Cancel Create"
                          tooltipClass="bg-destructive/80"
                          buttonProps={{
                            type: "button",
                            className: "bg-destructive hover:bg-destructive/80",
                            onClick: () => setAddMode(false),
                          }}
                          icon={<Icon icon={"material-symbols:cancel"} />}
                        />
                        <TooltipButton
                          tooltip="Save Vehicle"
                          tooltipClass="bg-green-500/80"
                          buttonProps={{
                            type: "submit",
                            className: "bg-green-500 hover:bg-green-500/80",
                          }}
                          icon={<Icon icon={"material-symbols:save"} />}
                        />
                      </div>
                      <div className="w-full">
                        <EditableImage
                          setImageUrl={(imageUrl: string) => {
                            setImageUrl(imageUrl);
                            setValue("imageUrl", imageUrl);
                          }}
                          imageUrl={imageUrl}
                          className="w-full h-64"
                          borderRadiusClass="rounded-lg"
                          instantUpload={true}
                          renderActions={customImageActions}
                        />
                        {errors.imageUrl && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.imageUrl.message as string}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name="brand"
                            label="Brand"
                            placeholder="Enter brand..."
                            hideErrorMessage
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name="model"
                            label="Model"
                            placeholder="Enter model..."
                            hideErrorMessage
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name="color"
                            label="Color"
                            placeholder="Chose color"
                            type="custom"
                            hideErrorMessage
                          >
                            <ColorSelect />
                          </FormField>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name="plate"
                            label="Number Plate"
                            placeholder="Enter number plate..."
                            hideErrorMessage
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <FormField
                            name="maxPassengers"
                            inputType="number"
                            min={1}
                            label="Max Passengers"
                            hideErrorMessage
                            placeholder="Enter max passengers..."
                          />
                        </div>
                      </div>
                    </form>
                  </FormProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
