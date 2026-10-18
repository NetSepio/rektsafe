import { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms of service for using rektSafe. Understand your responsibilities, our limitations, and the open source MIT license.",
  keywords: [
    "terms",
    "terms of service",
    "terms and conditions",
    "legal",
    "disclaimer",
    "MIT license",
    "open source",
  ],
  alternates: { canonical: "/terms/" },
  openGraph: {
    title: "Terms of Service | rektSafe",
    description: "Terms and conditions for using rektSafe.",
    type: "website",
    url: "https://rektsafe.com/terms/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | rektSafe",
    description: "Terms and conditions for using rektSafe.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};
