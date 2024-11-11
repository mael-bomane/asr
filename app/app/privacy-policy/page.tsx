import Link from "next/link";
import { getSEOTags } from "@/lib/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `privacy policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          privacy policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: 2024-11-07

At monolith (accessible from https://monolith.haus), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you visit our website.
1. Information We Collect

We collect the following types of data from users of our website:

Personal Data:

    Wallet Public Address: We collect your wallet public address to provide certain functionalities on the website.
    GitHub Account Details: If you connect your GitHub account, we collect relevant details associated with your account to enhance the user experience.

Non-Personal Data:

    Web Cookies: We use cookies to improve your user experience by remembering preferences and tracking website usage.

2. Purpose of Data Collection

The data we collect is used to improve your experience on our website and ensure the functionality of certain features. We do not use this data for any other purposes.
3. Data Sharing

We do not share any personal or non-personal data with third parties. Your information is solely used within the scope of enhancing your experience on monolith.
4. Children's Privacy

We do not knowingly collect any personal data from children under the age of 13. If we become aware that we have inadvertently collected data from a child, we will take steps to remove that information from our records.
5. Updates to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Users will be notified of any changes via email.
6. Contact Information

If you have any questions or concerns about this Privacy Policy, please contact us at:

Email: support@monolith.haus`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
