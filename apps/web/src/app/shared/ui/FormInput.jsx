import { focusColors } from "./formControlStyles";

const sizes = { xs: "input-xs", sm: "input-sm" };

export default function FormInput({ controlSize, focusColor, className, ...props }) {
  const classes = ["input input-bordered", sizes[controlSize], focusColors[focusColor], className];
  return <input {...props} className={classes.filter(Boolean).join(" ")} />;
}
