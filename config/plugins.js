module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env("CDN_URL"),
        rootPath: env("CDN_ROOT_PATH"),
        s3Options: {
          accessKeyId: "AKIATCKAPPCDTIPQJUR2",
          secretAccessKey: "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",
          region: "eu-west-1",
          params: {
            ACL: env("AWS_ACL", "public-read"),
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: "joyeriarosant-strapi",
          },
        },
      },
    },
  },
});
