export const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
        const data = new FormData();

        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        data.append("file", {
            uri: imageUri,
            type: `image/${fileType}` || 'image/jpeg',
            name: `upload.${fileType}` || 'upload.jpg',
        } as any);

        data.append("upload_preset", "emalungo_cloudinary");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/de7pp8857/image/upload",
            {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return null;
        }

        const result = await response.json();
        if (result.secure_url) {
            console.log("Upload realizado com sucesso:", result.secure_url);
            return result.secure_url;
        } else {
            console.error("Erro no upload: URL segura não encontrada", result);
            return null;
        }
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        return null;
    }
};