import Image from "next/image";
import icon from "@/assets/images/icon.png";

export default function Header() {
    return (
        <header>
           <nav className="max-w-7xl mx-auton flex" >
                <Image 
                    src={icon}
                    alt="BidLive Icon"
                    width={150}
                    height={100}
                />

                <div>


                </div>
           </nav>
        </header>
    );
}