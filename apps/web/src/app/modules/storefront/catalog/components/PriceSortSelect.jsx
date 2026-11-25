import { useI18n } from "../../../../../i18n";

export default function PriceSortSelect({ active, order, onChange }) {
  const { t } = useI18n();
  return (
    <select aria-label={t("catalog.sort_price")}
      className={`select select-sm outline-none focus:outline-none min-w-[160px] font-normal ${active ? 'bg-secondary text-secondary-content border-secondary' : 'bg-base-100 border-transparent'}`}
      value={active ? order : 'default'}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="default" disabled className="bg-base-100 text-base-content">{t("catalog.price")}</option>
      <option value="asc" className="bg-base-100 text-base-content">{t("catalog.price_low_high")}</option>
      <option value="desc" className="bg-base-100 text-base-content">{t("catalog.price_high_low")}</option>
    </select>
  );
}
