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

    const site = new sst.aws.Nextjs("MyWeb", {
      link: [swatBlocSecret],
      environment: {
        NEXT_PUBLIC_SWATBLOC_KEY: "pk_live_Fu3btBtlMidrBfC2N2IAZnbm06OlOeOY",
        NEXT_PRIVATE_SWATBLOC_KEY: swatBlocSecret.value,
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
