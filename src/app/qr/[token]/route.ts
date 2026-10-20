import QRCode from "qrcode";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { voucherUrl } from "@/lib/vouchers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/qr/[token]">
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { token } = await ctx.params;
  const voucher = await prisma.voucher.findFirst({
    where: { token, combo: { institutionId: user.institutionId } },
  });
  if (!voucher) return new Response("Not found", { status: 404 });

  const png = await QRCode.toBuffer(voucherUrl(token), {
    width: 512,
    margin: 2,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
