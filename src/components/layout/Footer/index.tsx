import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import { PaymentBadge, SocialNetworks } from "./footer.types";
import { FaFacebookF, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import LinksSection from "./LinksSection";
import Image from "next/image";
import NewsLetterSection from "./NewsLetterSection";
import LayoutSpacing from "./LayoutSpacing";

// Social media data
const socialsData: SocialNetworks[] = [
  {
    id: 1,
    icon: <FaLinkedin />,
    url: "https://linkedin.com",
  },
  {
    id: 2,
    icon: <FaFacebookF />,
    url: "https://facebook.com",
  },
  {
    id: 3,
    icon: <FaInstagram />,
    url: "https://instagram.com",
  },
];

// Payment badges data
const paymentBadgesData: PaymentBadge[] = [
  {
    id: 1,
    srcUrl: "/icons/Visa.svg",
  },
  {
    id: 2,
    srcUrl: "/icons/mastercard.svg",
  },
  {
    id: 3,
    srcUrl: "/icons/paypal.svg",
  },
  {
    id: 4,
    srcUrl: "/icons/applePay.svg",
  },
  {
    id: 5,
    srcUrl: "/icons/googlePay.svg",
  },
];

const Footer = () => {
  return (
    <footer className="mt-10">
      {/* Background overlay */}
      <div className="relative">
        <div className="absolute bottom-0 w-full h-1/2 bg-[#F0F0F0]"></div>
      </div>

      {/* Footer content */}
      <div className="pt-8 md:pt-[50px] bg-[#F0F0F0] px-4 pb-4">
        <div className="max-w-frame mx-auto">
          {/* Navigation section */}
          <nav className="lg:grid lg:grid-cols-12 mb-8">
            {/* Brand and social links */}
            <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
              <h1
                className={cn([
                  integralCF.className,
                  "text-[18px] lg:text-[20px] mb-6",
                ])}
              >
                L&rsquo;Approvisionneur Technique International SA
              </h1>
              <p className="text-black/60 text-sm mb-9">
                Désormais, vos urgences et vos contraintes deviennent les notres
              </p>
              <div className="flex items-center">
                {socialsData.map((social) => (
                  <Link
                    href={social.url}
                    key={social.id}
                    className="bg-white hover:bg-black hover:text-white transition-all mr-3 w-7 h-7 rounded-full border border-black/20 flex items-center justify-center p-1.5"
                    aria-label={`Visit our ${social.icon} page`}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Links section */}
            <div className="hidden lg:grid col-span-9 lg:grid-cols-4 lg:pl-10">
              <LinksSection />
            </div>
            <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4">
              <LinksSection />
            </div>
          </nav>

          {/* Divider */}
          <hr className="h-[1px] border-t-black/10 mb-6" />

          {/* Footer bottom section */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-2">
            {/* Copyright text */}
            <p className="text-sm text-center sm:justify-between justify-center text-black/60 mb-4 sm:mb-0 sm:mr-1">
              L'approvisionneur Technique International SA © 2025
            </p>

            {/* Payment badges */}
            {/* <div className="flex items-center">
              {paymentBadgesData.map((badge) => (
                <span
                  key={badge.id}
                  className={cn([
                    "w-[46px] h-[30px] rounded-[5px] border-[#D6DCE5] bg-white flex items-center justify-center",
                    badge.id !== paymentBadgesData.length && "mr-3", // Add margin except for the last item
                  ])}
                >
                  <div style={{ position: 'relative', width: '33px', height: '15px' }}>
                    <Image
                      priority
                      src={badge.srcUrl}
                      alt={`${badge.srcUrl.split("/").pop()?.split(".")[0]} logo`}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </span>
              ))}
            </div> */}
          </div>
        </div>

        {/* Layout spacing */}
        <LayoutSpacing />
      </div>
    </footer>
  );
};

export default Footer;