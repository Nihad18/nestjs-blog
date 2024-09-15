export default async () => ({
  transport: {
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  },
  defaults: {
    from: `"No Reply" <${process.env.MAIL_FROM}>`,
  },
});