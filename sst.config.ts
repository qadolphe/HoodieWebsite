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
    const swatBlocPublicKey = new sst.Secret("SwatBlocPublicKey");
    const swatBlocSecretKey = new sst.Secret("SwatBlocSecretKey");

    const site = new sst.aws.Nextjs("MyWeb", {
      link: [swatBlocPublicKey, swatBlocSecretKey],
      environment: {
        NEXT_PUBLIC_SWATBLOC_KEY: swatBlocPublicKey.value,
        NEXT_PRIVATE_SWATBLOC_KEY: swatBlocSecretKey.value,
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
