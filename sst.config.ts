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
    // 1. Create the Next.js app (Assign it to a variable 'site')
    const site = new sst.aws.Nextjs("MyWeb", {
      environment: {
        // Your Supabase keys will go here later
        // NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    });

    // 2. Return the URL so it prints in the terminal
    // return {
    //   websiteUrl: site.url
    // };
  }
});

