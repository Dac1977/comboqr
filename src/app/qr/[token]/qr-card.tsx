export function QrCard({
  qrSrc,
  title,
  note,
  meta,
}: {
  qrSrc: string;
  title: string;
  note: string | null;
  meta: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 28,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrSrc} width={400} height={400} alt="QR" />
      <div
        style={{
          display: "flex",
          marginTop: 18,
          fontSize: 26,
          fontWeight: 700,
          color: "#111827",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {note ? (
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 20,
            fontWeight: 600,
            color: "#1d4ed8",
            textAlign: "center",
          }}
        >
          {note}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontSize: 15,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        {meta}
      </div>
    </div>
  );
}
