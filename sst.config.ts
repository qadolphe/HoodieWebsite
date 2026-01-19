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
    const stripeSecret = new sst.Secret("StripeSecretKey");
    const stripeWebhookSecret = new sst.Secret("StripeWebhookSecret");

    const site = new sst.aws.Nextjs("MyWeb", {
      link: [stripeSecret, stripeWebhookSecret],
      environment: {
        NEXT_PUBLIC_SWATBLOC_KEY: "pk_live_dnX7sfOjZoIhBrisMOQ5J9NFS6Ee1V2W",
        STRIPE_SECRET_KEY: stripeSecret.value,
        STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
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
