import api from "./apiInstance";

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<string>("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload the image");
  }
};

export const removeImage = async (imageUrl?: string): Promise<string> => {
  const { data } = await api.delete<string>("/images", {
    params: {
      imageUrl: imageUrl,
    },
  });

  return data;
};
