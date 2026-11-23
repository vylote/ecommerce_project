import { useI18n } from "../../../i18n";

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
}) {
  const { t } = useI18n();
  const buttonClass = "min-w-8 px-3 py-1.5 hover:bg-base-200 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div role="group" aria-label={t("cart.quantity")} className="inline-flex items-stretch rounded-sm border border-base-300 text-base-content">
      <button type="button" className={buttonClass} aria-label={t("cart.decrease_quantity")} disabled={decreaseDisabled} onClick={onDecrease}>
        -
      </button>
      <output className="grid min-w-10 place-items-center border-x border-base-300 px-2 text-sm font-medium">
        {value}
      </output>
      <button type="button" className={buttonClass} aria-label={t("cart.increase_quantity")} disabled={increaseDisabled} onClick={onIncrease}>
        +
      </button>
    </div>
  );
}
