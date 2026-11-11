import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { upload, remove } = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { storage: { from: () => ({ upload, remove }) } } }));
import { uploadCarPhoto } from "./car-photos";

let webp: boolean;
let bitmap: { width: number; height: number; close: ReturnType<typeof vi.fn> };
let encodings: Array<{ type: string; quality: number; width: number; height: number }>;
beforeEach(() => {
  webp = true;
  encodings = [];
  bitmap = { width: 4000, height: 3000, close: vi.fn() };
  upload.mockReset().mockResolvedValue({ error: null });
  remove.mockReset().mockResolvedValue({ error: null });
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn(), fillRect: vi.fn() } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(() => webp ? "data:image/webp;base64,AA" : "data:image/png;base64,AA");
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (this: HTMLCanvasElement, callback, type, quality) {
    encodings.push({ type: type ?? "", quality: quality ?? 0, width: this.width, height: this.height });
    callback(new Blob(["photo"], { type: type === "image/webp" && !webp ? "image/png" : type ?? "image/png" }));
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const photo = () => new File(["photo"], "iphone.jpg", { type: "image/jpeg" });

it("uploads JPEG at quality 0.82 when Safari cannot encode WebP", async () => {
  webp = false;
  const result = await uploadCarPhoto(photo());
  expect(result.main).toMatch(/\/main\.jpg$/);
  expect(result.thumb).toMatch(/\/thumb\.jpg$/);
  expect(encodings.map(e => [e.type, e.quality])).toEqual([["image/jpeg", 0.82], ["image/jpeg", 0.82]]);
  expect(upload.mock.calls.map(c => c[2].contentType)).toEqual(["image/jpeg", "image/jpeg"]);
});
it("keeps supported WebP and resizes the longest side to 1600", async () => {
  const result = await uploadCarPhoto(photo());
  expect([result.w, result.h]).toEqual([1600, 1200]);
  expect(result.main).toMatch(/\.webp$/);
  expect(encodings.map(e => [e.width, e.height])).toEqual([[1600, 1200], [600, 450]]);
  expect(upload.mock.calls.map(c => c[2].contentType)).toEqual(["image/webp", "image/webp"]);
});
it("decodes using EXIF orientation and closes the bitmap", async () => {
  bitmap.width = 3000; bitmap.height = 4000;
  const file = photo();
  const result = await uploadCarPhoto(file);
  expect(createImageBitmap).toHaveBeenCalledWith(file, { imageOrientation: "from-image" });
  expect([result.w, result.h]).toEqual([1200, 1600]);
  expect(bitmap.close).toHaveBeenCalledOnce();
});
it("uploads the original below 5 MB if compression fails", async () => {
  vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(cb => cb(null));
  const file = photo();
  const result = await uploadCarPhoto(file);
  expect(result.main).toBe(result.thumb);
  expect(result.main).toMatch(/\/original\.jpg$/);
  expect(upload).toHaveBeenCalledTimes(1);
  expect(upload.mock.calls[0]?.[1]).toBe(file);
  expect(upload.mock.calls[0]?.[2].contentType).toBe("image/jpeg");
  expect(bitmap.close).toHaveBeenCalledOnce();
});
it("asks for a smaller photo if compression fails at 5 MB", async () => {
  vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(cb => cb(null));
  await expect(uploadCarPhoto(new File([new Uint8Array(5 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" }))).rejects.toThrow(/smaller photo.*5 MB/i);
  expect(upload).not.toHaveBeenCalled();
});
it("never treats a storage error as a compression failure", async () => {
  upload.mockResolvedValue({ error: new Error("Upload denied") });
  await expect(uploadCarPhoto(photo())).rejects.toThrow("Upload denied");
  expect(upload).toHaveBeenCalledTimes(1);
});