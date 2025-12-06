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
    const supabaseServiceRoleKey = new sst.Secret("SupabaseServiceRoleKey");

    const site = new sst.aws.Nextjs("MyWeb", {
      link: [stripeSecret, stripeWebhookSecret, supabaseServiceRoleKey],
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: "https://mwpautnftznfgzcxtpko.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_GREOi4yyH_HnwAcwHyBDwQ_mnfJTPot",
        STRIPE_SECRET_KEY: stripeSecret.value,
        STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey.value,
      }
    });
  }
});

