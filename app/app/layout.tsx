import { ReactNode } from "react";
import { Inconsolata } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/lib/seo";
import { ClientLayout } from "@/components/ClientLayout";
import config from "@/config";

import "./globals.css";
import "@radix-ui/themes/styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const font = Inconsolata({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// @ts-ignore
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={font.className}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
