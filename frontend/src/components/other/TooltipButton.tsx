import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TooltipButtonProps {
  tooltip: string;
  tooltipClass: string;
  buttonProps: React.ComponentProps<typeof Button>;
  icon: React.ReactNode;
}

const TooltipButton = ({
  tooltip,
  tooltipClass,
  buttonProps,
  icon,
}: TooltipButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button {...buttonProps}>{icon}</Button>
    </TooltipTrigger>
    <TooltipContent className={tooltipClass}>
      <p className="text-white text-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export default TooltipButton;
