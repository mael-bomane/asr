import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  appName: "Monolith",
  appDescription: "active staking reward & voting escrow",
  github: "",
  discord: "",
  xTwitter: "monolith_haus",
  domainName: "monolith.haus",
  aws: {
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  colors: {
    theme: "dark",
    main: themes["dark"]["primary"],
  },
  auth: {
    loginUrl: "/login",
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
