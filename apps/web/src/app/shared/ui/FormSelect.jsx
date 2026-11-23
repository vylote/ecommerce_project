import { focusColors } from "./formControlStyles";

const sizes = { xs: "select-xs", sm: "select-sm" };

export default function FormSelect({ controlSize, focusColor, className, ...props }) {
  const classes = ["select select-bordered", sizes[controlSize], focusColors[focusColor], className];
  return <select {...props} className={classes.filter(Boolean).join(" ")} />;
}
