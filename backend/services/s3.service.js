const {
  S3Client,
  PutObjectCommand
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const accessKeyId =
  process.env.AWS_ACCESS_KEY;

const secretAccessKey =
  process.env.AWS_SECRET_KEY;

const region =
  process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({
  region,

  credentials: {
    accessKeyId,
    secretAccessKey
  },

  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
});

exports.generatePresignedUrl = async (s3Key) => {

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,

  });

  const signedUrl = await getSignedUrl(
    s3Client,
    command,
    {
      expiresIn: 900
    }
  );

  console.log("SIGNED URL:");
  console.log(signedUrl);

  return signedUrl;
};