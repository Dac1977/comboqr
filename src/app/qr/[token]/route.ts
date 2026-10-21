import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { voucherUrl } from "@/lib/vouchers";
import { QrCard } from "./qr-card";

const fontRegular = fetch(
  "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff"
).then((r) => r.arrayBuffer());

const fontBold = fetch(
  "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff"
).then((r) => r.arrayBuffer());

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

  const qrDataUrl = await QRCode.toDataURL(voucherUrl(token), {
    width: 400,
    margin: 0,
  });

  const title = truncate(voucher.combo.title, 40);
  const note = voucher.recipientInfo
    ? truncate(voucher.recipientInfo, 60)
    : null;
  const meta = `${voucher.totalQty} combos · ${voucher.token.slice(0, 12)}`;

  const [regular, bold] = await Promise.all([fontRegular, fontBold]);

  const image = new ImageResponse(
    QrCard({ qrSrc: qrDataUrl, title, note, meta }),
    {
      width: 520,
      height: 660,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "private, no-cache" },
    }
  );

  const png = await image.arrayBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-cache",
    },
  });
}
