/** Resize an image file in the browser and return a compact data URL (stored directly in the database). */
export async function fileToResizedDataUrl(file: File, maxSize = 640, type: "image/jpeg" | "image/png" = "image/jpeg"): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not resize this image");
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (type === "image/png") {
      // Logos remain PNG for browser PDF compatibility; reduce dimensions until
      // both the binary and stored data URL are comfortably under 50 KB.
      for (let attempt = 0; attempt < 12; attempt++) {
        const data = canvas.toDataURL("image/png");
        if (data.length < 50000) return data;
        canvas.width = Math.max(32, Math.floor(canvas.width * 0.8));
        canvas.height = Math.max(32, Math.floor(canvas.height * 0.8));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      throw new Error("Could not reduce this logo below 50 KB");
    }
    return canvas.toDataURL(type, 0.7);
  } finally {
    URL.revokeObjectURL(url);
  }
}
