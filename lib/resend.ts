import { readFileSync } from "fs";
import { join } from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "LaWallet <waitlist@lawallet.io>";
const SITE_URL = process.env.SITE_URL || "https://lawallet.io";

const templatePath = join(process.cwd(), "templates", "waitlist-welcome.html");
const templateHtml = readFileSync(templatePath, "utf-8");

function renderTemplate(): string {
  const logoUrl = `${SITE_URL}/logos/lawallet.svg`;
  const year = new Date().getFullYear().toString();

  return templateHtml
    .replaceAll("{{SITE_URL}}", SITE_URL)
    .replaceAll("{{LOGO_URL}}", logoUrl)
    .replaceAll("{{YEAR}}", year);
}

export async function sendWaitlistWelcomeEmail(to: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to the LaWallet Waitlist!",
      html: renderTemplate(),
    });

    if (error) {
      console.warn("Resend email failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      "Resend email error:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
