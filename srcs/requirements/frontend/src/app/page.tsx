import Image from "next/image";
import icon from "@/assets/images/icon.png"

export default function Home() {
  return (
    <div className="">
      
      <Image
        src={icon}
        width={200}
        height={200}
        alt="BidLive Logo"
        className="mx-auto mt-20 animate-pulse"
      />
      <h1 className="text-4xl font-bold text-center mt-10 text-gray-800">
        Bem-vindo ao BidLive!
      </h1>
      <p className="text-center mt-4 text-gray-600">
        A plataforma de leilões em tempo real onde os lances nunca param!
      </p>
    </div>
  );
}
