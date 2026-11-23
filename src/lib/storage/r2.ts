import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { productImageKey, productImageUrl } from "@/lib/storage/images";

export function isR2Configured() {
  return Boolean(env.r2AccountId && env.r2AccessKeyId && env.r2SecretAccessKey && env.r2Bucket && env.r2PublicBaseUrl);
}

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId ?? "",
      secretAccessKey: env.r2SecretAccessKey ?? "",
    },
  });
}

export async function uploadProductPhoto(input: { productId: string; body: Uint8Array; contentType: string }) {
  if (!isR2Configured() || !env.r2Bucket || !env.r2PublicBaseUrl) {
    throw new Error("Photo storage is not ready.");
  }
  const key = productImageKey(input.productId, input.contentType);
  await client().send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return productImageUrl(env.r2PublicBaseUrl, key);
}
