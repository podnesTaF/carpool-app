import Image from "next/image";

export default function EmptyListPlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-y-6 my-12">
      <Image
        src="/Carpool1.png"
        alt="Carpool Image"
        width={200} // Set width for the image
        height={200} // Set height for the image
        className="object-cover opacity-60"
      />
      <p className="text-black font-semibold">{title}</p>
      {subtitle && <p className="opacity-80 text-center">{subtitle}</p>}
    </div>
  );
}
