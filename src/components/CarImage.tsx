import { Car as CarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { readPhotos, usePhotoUrls } from "@/lib/car-photos";
import type { Car } from "@/lib/data";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

/** Cover photo of a car: thumbnail for lists, main version for detail views. */
export function CarImage({ car, size, priority = false, className = "" }: { car: Car; size: "thumb" | "main"; priority?: boolean; className?: string }) {
  return <CarGallery key={`${car.id}-${size}-${JSON.stringify(car.photos)}`} car={car} size={size} priority={priority} className={className} />;
}

function CarGallery({ car, size, priority, className }: { car: Car; size: "thumb" | "main"; priority: boolean; className: string }) {
  const photos = readPhotos(car.photos);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(priority);
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [loaded, setLoaded] = useState<number[]>([]);
  const [failed, setFailed] = useState<number[]>([]);
  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "0px" });
    observer.observe(element); return () => observer.disconnect();
  }, [visible]);
  useEffect(() => {
    if (!api) return;
    const select = () => { const i = api.selectedScrollSnap(); setSelected(i); setVisited((v) => v.includes(i) ? v : [...v, i]); };
    api.on("select", select); return () => { api.off("select", select); };
  }, [api]);
  const paths = visible ? photos.flatMap((p, i) => visited.includes(i) ? size === "main" ? [p.thumb, p.main] : [p.thumb] : []) : [];
  const urls = usePhotoUrls(paths);
  const image = (i: number) => {
    const photo = photos[i];
    // Legacy URLs have no guaranteed small variant: never use them in lists.
    const src = visible && visited.includes(i) ? photo ? urls[photo.thumb] : size === "main" ? car.photo_url : null : null;
    const thumbWidth = photo ? Math.round(photo.w * Math.min(1, 600 / Math.max(photo.w, photo.h))) : 600;
    const sources = photo && src ? size === "main" && urls[photo.main] ? `${src} ${thumbWidth}w, ${urls[photo.main]} ${photo.w}w` : `${src} ${thumbWidth}w` : undefined;
    return <div className="relative h-full w-full bg-photo-placeholder">
      {!loaded.includes(i) && <div className="absolute inset-0 flex items-center justify-center"><CarIcon className="h-12 w-12 text-muted-foreground" /></div>}
      {src && !failed.includes(i) && <img src={src} srcSet={sources} sizes={size === "main" ? "(max-width: 639px) 90vw, 616px" : "(min-width: 1024px) 320px, (min-width: 640px) 46vw, 92vw"} alt={`${car.name} available for rent in Mauritius${photos.length > 1 ? ` — photo ${i + 1} of ${photos.length}` : ""}`} loading={priority && i === 0 ? "eager" : "lazy"} fetchPriority={priority && i === 0 ? "high" : "auto"} decoding="async" draggable={false} width={photo?.w ?? 640} height={photo?.h ?? 400} onLoad={() => setLoaded((v) => v.includes(i) ? v : [...v, i])} onError={() => setFailed((v) => [...v, i])} className={`h-full w-full object-cover motion-safe:transition-opacity ${loaded.includes(i) ? "opacity-100" : "opacity-0"}`} />}
    </div>;
  };
  if (photos.length < 2) return <div ref={ref} className={className}>{image(0)}</div>;
  return <div ref={ref} className={className}><Carousel setApi={setApi} opts={{ loop: true }} className="h-full w-full overflow-hidden" aria-label={`${car.name} photos`}>
    <CarouselContent className="ml-0 h-full">{photos.map((p, i) => <CarouselItem key={p.main} className="h-full pl-0"><div className="aspect-[16/10] h-full w-full">{image(i)}</div></CarouselItem>)}</CarouselContent>
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <CarouselPrevious type="button" className="left-2 h-10 w-10 bg-card/90" aria-label="Previous car photo" title="Previous car photo" />
      <CarouselNext type="button" className="right-2 h-10 w-10 bg-card/90" aria-label="Next car photo" title="Next car photo" />
    </div>
    <span className="sr-only" aria-live="polite">Photo {selected + 1} of {photos.length}</span>
  </Carousel></div>;
}
