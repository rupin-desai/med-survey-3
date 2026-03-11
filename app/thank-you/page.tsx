import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, PartyPopper } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-fade-in-up shadow-xl border-0">
        <CardContent className="pt-10 pb-10 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-light">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>

          <h1 className="mb-3 text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            Thank You! <PartyPopper className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Your survey response has been submitted successfully. We appreciate
            your valuable time and feedback.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
