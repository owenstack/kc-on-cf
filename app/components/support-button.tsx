import { openTelegramLink } from "@telegram-apps/sdk-react";
import { Button } from "~/components/ui/button";
import { CircleQuestionMark } from "lucide-react";

export function FloatingSupportButton() {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                variant="outline"
                size="sm"
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border-2"
                onClick={() =>
                    openTelegramLink(
                        "https://t.me/GalaxyMEVSupport",
                    )
                }
            >
               <CircleQuestionMark />
                Support
            </Button>
        </div>
    );
}