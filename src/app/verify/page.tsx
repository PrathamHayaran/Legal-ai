import { SiteShell } from "@/components/site-shell";
import { VerificationWizard } from "@/components/verification-wizard";

export default function VerifyPage() {
  return (
    <SiteShell title="Verification center" subtitle="Complete your lawyer verification journey with a premium guided experience built for trust and speed.">
      <div className="space-y-8">
        <VerificationWizard />
      </div>
    </SiteShell>
  );
}
