import Image from "next/image";
export default function NoEventData() {
  return (
    <div className="flex flex-col justify-center items-center gap-y-2 md:my-12">
      <Image
        src="/Carpool3.png"
        alt="Carpool Image"
        width={190} // Set width for the image
        height={190} // Set height for the image
        className="mx-auto object-cover opacity-60"
      />
      <p className="text-black font-semibold">Search for an event</p>
      <p className="opacity-80">
        Find an event by entering event&quot;s name or location
      </p>
    </div>
  );
}
