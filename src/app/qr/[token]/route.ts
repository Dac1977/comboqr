import QRCode from "qrcode";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { voucherUrl } from "@/lib/vouchers";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/qr/[token]">
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { token } = await ctx.params;
  const voucher = await prisma.voucher.findFirst({
    where: { token, combo: { institutionId: user.institutionId } },
    include: { combo: true },
  });
  if (!voucher) return new Response("Not found", { status: 404 });

  const qrSvg = await QRCode.toString(voucherUrl(token), {
    type: "svg",
    width: 460,
    margin: 0,
  });

  const title = escapeXml(truncate(voucher.combo.title, 30));
  const note = voucher.recipientInfo
    ? escapeXml(truncate(voucher.recipientInfo, 44))
    : null;
  const meta = `${voucher.totalQty} combos · ${voucher.token.slice(0, 12)}`;

  const height = note ? 600 : 570;
  const positionedQr = qrSvg
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace("<svg", '<svg x="30" y="20" width="460" height="460"');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="${height}">
  <rect width="100%" height="100%" rx="16" fill="white"/>
  ${positionedQr}
  <text x="260" y="512" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="#111">${title}</text>
  ${note ? `<text x="260" y="540" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#2563eb">${note}</text>` : ""}
  <text x="260" y="${height - 16}" text-anchor="middle" font-family="monospace" font-size="13" fill="#666">${meta}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-cache",
    },
  });
}
