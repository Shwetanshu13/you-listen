// apps/backend/src/lib/r2.ts
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { config } from "../conf/conf";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export const deleteFromBucket = async (fileUrl: string) => {
  try {
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.split("/").pop()!); // Extract filename

    console.log("Key to delete:", key);

    const res = await r2.send(
      new DeleteObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
      })
    );

    console.log("Delete result:", res);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error;
  }
};

export const uploadToBucket = async (
  fileBuffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> => {
  const sanitized = originalName.replace(/\s+/g, "_");
  const filename = `${Date.now()}_${sanitized}`;

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: config.r2.bucketName,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
    },
  });

  await upload.done();

  const fileUrl = `${config.r2.endpoint}/${config.r2.bucketName}/${filename}`;
  return fileUrl;
};

export const getSignedAudioUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2, command, {
    expiresIn: 60 * 60, // 1 hour
  });

  return signedUrl;
};
