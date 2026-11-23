import { Link } from "react-router-dom";
import GoogleAuthButton from "../GoogleAuthButton";

export default function AuthAlternatives({ divider, prompt, to, linkLabel }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px bg-base-300" />
        <span className="text-xs text-base-content/50">{divider}</span>
        <div className="flex-1 h-px bg-base-300" />
      </div>

      <GoogleAuthButton />

      <p className="mt-7 pt-5 border-t border-base-300 text-center text-sm text-base-content/60">
        {prompt}{' '}
        <Link to={to} className="font-semibold text-secondary hover:underline">
          {linkLabel}
        </Link>
      </p>
    </>
  );
}
