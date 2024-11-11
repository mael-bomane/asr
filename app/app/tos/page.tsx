import Link from "next/link";
import { getSEOTags } from "@/lib/seo";
import config from "@/config";


export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          {config.appName} privacy policy
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: November 11, 2024

Welcome to Monolith (https://monolith.haus). By accessing or using our website, services, and related platforms (collectively referred to as "Services"), you agree to comply with and be bound by the following Terms & Services.

    Description of Services Monolith provides active staking rewards and voting escrow creation tools on the Solana blockchain and soon other blockchains (currently in Devnet). It is an open-source project developed as part of the Soon Genesis Hackathon. For hackathon details, visit Soon Genesis Hackathon.

    No Warranty The Services are provided "as-is" without any warranty or guarantee of any kind. Monolith does not guarantee the accuracy, reliability, or availability of the Services, and use of the Services is at your own risk.

    User Data Collection
        Personal Data: We collect IP addresses for rate-limiting purposes on our API routes. We also collect wallet addresses and token amounts for analytics.
        Non-Personal Data: We use cookies to collect non-personal data for improving site functionality. By using our Services, you consent to our use of cookies.
        For more details on how we handle your data, please refer to our Privacy Policy.

    Use of Services You agree not to use the Services for any illegal, harmful, or unauthorized activities, including but not limited to unauthorized access to the platform or its data.

    Ownership and Intellectual Property Monolith is an open-source project. All intellectual property related to the Services is owned by the developers or third parties. By using the Services, you do not acquire any rights to these intellectual properties.

    Limitation of Liability To the maximum extent permitted by applicable law, Monolith shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Services.

    Updates to Terms Monolith may update these Terms & Services from time to time. Any changes will be reflected on our Privacy Policy page. You are encouraged to review the Terms regularly.

    Governing Law These Terms & Services are not governed by any specific jurisdiction or law.

    Contact Information If you have any questions about these Terms & Services, please contact us at support@monolith.haus.

By using Monolith’s Services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Services.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
