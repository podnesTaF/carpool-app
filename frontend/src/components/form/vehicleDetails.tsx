import ColorSelect, { colors } from "@/components/form/colorSelect";
import { Vehicle } from "@/models/vehicle";
import { VehicleEditSchema, vehicleEditSchema } from "@/utils/car-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Edit } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import EditableImage from "../other/EditableImage";
import TooltipButton from "../other/TooltipButton";
import { Button } from "../ui/button";
import FormField from "./FormField";
interface VehicleDetailsProps {
  vehicle: Vehicle;
  editMode: number | null;
  setEditMode: (id: number | null) => void;
  handleDelete: (id: number) => void;
  onSubmitEdit: (data: {
    data: VehicleEditSchema;
    vehicle: Vehicle;
    imageUrl?: string;
  }) => void;
}

export default function VehicleDetails({
  vehicle,
  editMode,
  setEditMode,
  handleDelete,
  onSubmitEdit,
}: VehicleDetailsProps) {
  const [imageUrl, setImageUrl] = useState<string>(vehicle.imgUrl);

  const editFormMethods = useForm<z.infer<typeof vehicleEditSchema>>({
    resolver: zodResolver(vehicleEditSchema),
    defaultValues: {
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      plate: vehicle.plate,
      maxPassengers: vehicle.maxPassengers,
      imageUrl: vehicle.imgUrl,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = editFormMethods;

  const customImageActions = ({
    handleEditClick,
  }: {
    selectedFile: File | null;
    isUploading: boolean;
    isDeleting: boolean;
    handleSaveClick: () => void;
    handleEditClick: () => void;
    handleDeleteClick: () => void;
  }) =>
    editMode ? (
      <div className="absolute top-3 left-3 flex gap-2">
        <Button type="button" onClick={handleEditClick} variant={"ghost"}>
          <Edit className="text-primary-orange" />
        </Button>
      </div>
    ) : null;

  return (
    <FormProvider {...editFormMethods}>
      <form
        key={vehicle.id}
        onSubmit={handleSubmit((data) =>
          onSubmitEdit({ data, vehicle, imageUrl })
        )}
        className="flex flex-col gap-5 w-full bg-primary-white rounded-2xl p-5 relative"
      >
        <div
          className={`flex w-full items-center gap-5 ${
            editMode !== vehicle.id ? "justify-end" : "justify-between"
          }`}
        >
          {editMode === vehicle.id ? (
            <>
              <TooltipButton
                tooltip="Delete Vehicle"
                tooltipClass="bg-destructive/80"
                buttonProps={{
                  type: "button",
                  className: "bg-destructive hover:bg-destructive/80",
                  onClick: () => handleDelete(vehicle.id),
                }}
                icon={<Icon icon="mdi:bin" />}
              />
              <TooltipButton
                tooltip="Cancel Edit"
                tooltipClass="bg-orange-500/80"
                buttonProps={{
                  type: "button",
                  className: "bg-orange-500 hover:bg-orange-500/80",
                  onClick: () => setEditMode(null),
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
            </>
          ) : (
            <TooltipButton
              tooltip="Edit Vehicle"
              tooltipClass="bg-secondary/80"
              buttonProps={{
                type: "button",
                className: "bg-secondary hover:bg-secondary/80",
                onClick: () => setEditMode(vehicle.id),
              }}
              icon={<Icon icon={"material-symbols:edit"} />}
            />
          )}
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
            muted={editMode !== vehicle.id}
            hideActions={editMode !== vehicle.id}
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
              value={vehicle.brand}
              isNotEdit={editMode !== vehicle.id}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <FormField
              name="model"
              label="Model"
              placeholder="Enter model..."
              hideErrorMessage
              value={vehicle.model}
              isNotEdit={editMode !== vehicle.id}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            {editMode === vehicle.id ? (
              <FormField
                name="color"
                label="Color"
                placeholder="Chose color"
                type="custom"
                value={vehicle.color}
                hideErrorMessage
                isNotEdit={editMode !== vehicle.id}
              >
                <ColorSelect gotValue={vehicle.color} />
              </FormField>
            ) : (
              <FormField
                name="color"
                label="Color"
                placeholder="Chose color"
                type="custom"
                value={vehicle.color}
                hideErrorMessage
              >
                <div className="text-secondary text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full mr-2 border"
                      style={{
                        backgroundColor: colors.find(
                          (color) => color.value === vehicle.color
                        )?.hex,
                      }}
                    ></div>
                    {colors.find((color) => color.value === vehicle.color)?.label}
                  </div>
                </div>
              </FormField>
            )}
          </div>
          <div className="grid w-full items-center gap-1.5">
            <FormField
              name="plate"
              label="Number Plate"
              placeholder="Enter number plate..."
              value={vehicle.plate}
              hideErrorMessage
              isNotEdit={editMode !== vehicle.id}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <FormField
              name="maxPassengers"
              inputType="number"
              min={1}
              label="Max Passengers"
              hideErrorMessage
              placeholder={String(vehicle.maxPassengers)}
              value={vehicle.maxPassengers}
              isNotEdit={editMode !== vehicle.id}
            />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
