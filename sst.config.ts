// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "hoodiewebsite",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const swatBlocSecret = new sst.Secret("SwatBlocSecret");

    const isProduction = $app.stage === "production";
    
    // Config values
    const PUBLIC_KEY_LIVE = "pk_live_Fu3btBtlMidrBfC2N2IAZnbm06OlOeOY";
    const PUBLIC_KEY_TEST = "pk_test_e4BOuC9vLrnsCiLsHCFWx0Z09udR384Q";
    const PRIVATE_KEY_TEST = "sk_test_hJU7ggUMWhTi3QWJPT20cgpt8n5mWCV4";

    const site = new sst.aws.Nextjs("MyWeb", {
      link: isProduction ? [swatBlocSecret] : [],
      environment: {
        NEXT_PUBLIC_SWATBLOC_KEY: isProduction ? PUBLIC_KEY_LIVE : PUBLIC_KEY_TEST,
        NEXT_PRIVATE_SWATBLOC_KEY: isProduction ? swatBlocSecret.value : PRIVATE_KEY_TEST,
      }
    });
  },
  console: {
    autodeploy: {
      target(event) {
        if (event.type === "branch" && event.branch === "main" && event.action === "pushed") {
          return { stage: "production" };
        }
      },
    }
  }
});
