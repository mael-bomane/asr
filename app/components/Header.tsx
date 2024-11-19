"use client";

import { useState, useEffect, useContext } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import config from "@/config";
import logo from "@/app/icon.png";
import { MonolithContext } from "./MonolithContextProvider";
import { IoLogoDiscord, IoLogoGithub } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";

const links: {
  href: string;
  label: string;
}[] = [
    // {
    // href: "/",
    // label: "home",
    // },
    // {
    // href: "/create",
    // label: "create",
    // },
    // {
    // href: "/explore",
    // label: "explore",
    // },
  ];

const cta: JSX.Element = <WalletMultiButton />

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const searchParams = useSearchParams();
  const { program, analytics, monoliths } = useContext(MonolithContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname()
  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  useEffect(() => {
    console.log(analytics)
  }, [analytics]);

  return (
    <header className="bg-[#000]">
      <nav
        className="container flex items-center justify-between px-8 py-2 mx-auto"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image src={logo}
              width={40}
              height={40}
              alt="logo"
              className="ml-4 rounded-xl"
              priority={true}
              unoptimized
            />
            <span className="font-extrabold text-lg text-white">{config.appName}</span>
          </Link>
        </div>
        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center text-white font-extrabold text-lg py-2">
          {pathname == '/' ? links.slice(1).map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="link link-hover"
              title={link.label}
            >
              {link.label}
            </Link>
          )) : links.map(link => (
            <Link
              href={link.href}
              key={link.href}
              className="link link-hover"
              title={link.label}
            >
              {link.label}
            </Link>

          ))}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1 flex items-center justify-center py-2">
          <div className="w-full flex items-center justify-end space-x-8">
            {config.xTwitter &&
              <Link href={`https://x.com/@${config.xTwitter}`} target="_blank">
                <FaXTwitter className="w-6 h-6 text-base-content" />
              </Link>
            }
            {config.discord &&
              <Link href={`https://discord.gg/${config.discord}`} target="_blank">
                <IoLogoDiscord className="w-8 h-8 text-base-content" />
              </Link>
            }
            {config.github &&
              <Link href={`https://github.com/${config.github}`} target="_blank">
                <IoLogoGithub className="w-8 h-8 text-base-content" />
              </Link>
            }
          </div>
          <div className="w-full flex items-around justify-center space-x-8">
            {cta}
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* Your logo/name on small screens */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0 "
              title={`${config.appName} homepage`}
              href="/"
            >
              {/*<Image
                src={logo}
                alt={`${config.appName} logo`}
                className="w-8"
                placeholder="blur"
                priority={true}
                width={32}
                height={32}
              />*/}
              <span className="font-extrabold text-lg">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Your links on small screens */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {pathname == '/' ? links.slice(1).map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="link link-hover"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                )) : links.map(link => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="link link-hover"
                    title={link.label}
                  >
                    {link.label}
                  </Link>

                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* Your CTA on small screens */}
            <div className="flex flex-col">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
