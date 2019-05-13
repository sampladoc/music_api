const hash =
  process.env.HASH || "ie65qw3ub5yek39r8a2fq6u7wjyivll8l0dr0s17aiuidc3948ux4um5ndyg9vdaay"

const serverSettings = {
  port: process.env.PORT || 3000,
}

const dbSettings = {
  db: process.env.DATABASE,
  database_server: `${process.env.DATABASE_SERVER}:27017`,
}

const aws = {
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY,
  bucketsRegion: process.env.AWS_BUCKET_REGION,
  bucketImages: process.env.AWS_BUCKET_NAME_IMAGE,
  bucketMedia: process.env.AWS_BUCKET_NAME,
}
module.exports = Object.assign({}, { dbSettings, serverSettings, aws, hash })
