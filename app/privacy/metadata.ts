import { Metadata } from "next";
import { ogImage } from "@/app/metadata";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How rektSafe handles privacy. Client-side keys, no accounts, and no analytics. zkSend uses public networks and Privacy Cash.",
  keywords: [
    "privacy",
    "privacy policy",
    "no tracking",
    "client-side encryption",
    "data protection",
    "open source",
  ],
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: "Privacy Policy | rektSafe",
    description: "Your data, your control. Learn about our privacy-first approach.",
    type: "website",
    url: "https://rektsafe.com/privacy/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | rektSafe",
    description: "Your data, your control. Learn about our privacy-first approach.",
    creator: "@NetSepio",
    images: [ogImage.url],
  },
};
