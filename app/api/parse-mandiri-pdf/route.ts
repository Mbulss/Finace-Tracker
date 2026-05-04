import { NextRequest, NextResponse } from "next/server";
import { parseMandiriPDFText } from "@/lib/mandiri-pdf-parser";
import { execFile } from "child_process";
import path from "path";

function runPdfParser(base64Data: string, password?: string): Promise<{ text: string; numpages: number }> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "parse-pdf.js");
    const args = password ? [scriptPath, password] : [scriptPath];

    const child = execFile(process.execPath, args, {
      maxBuffer: 100 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      try {
        const outString = stdout.trim();
        const jsonStart = outString.indexOf("{");
        const jsonString = jsonStart >= 0 ? outString.slice(jsonStart) : outString;
        const result = JSON.parse(jsonString);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch {
        reject(new Error(`PDF ERR: ${stderr || ""} | MSG: ${error?.message || ""} | OUT: ${stdout || ""}`));
      }
    });

    child.stdin?.write(base64Data);
    child.stdin?.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = (formData.get("password") as string) || "";

    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File PDF tidak ditemukan." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    let pdfResult;
    try {
      console.log("[parse-mandiri] password received:", password ? `"${password}" (${password.length} chars)` : "(none)");
      pdfResult = await runPdfParser(base64Data, password || undefined);
    } catch (parseErr: any) {
      const msg = parseErr.message ?? "";
      console.log("[parse-mandiri] parse error:", msg);
      if (msg === "password_required") {
        return NextResponse.json(
          {
            error: password
              ? "Password salah. Coba lagi."
              : "PDF ini dilindungi password. Masukkan password untuk membukanya.",
            needsPassword: true,
            wrongPassword: !!password,
          },
          { status: 422 }
        );
      }
      throw parseErr;
    }

    const rows = parseMandiriPDFText(pdfResult.text);

    return NextResponse.json({ rows, pageCount: pdfResult.numpages });
  } catch (err: any) {
    console.error("Parse Mandiri PDF error:", err);
    return NextResponse.json(
      { error: err.message ?? "Gagal membaca PDF." },
      { status: 500 }
    );
  }
}
