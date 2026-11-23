import { useI18n } from "../../../shared/i18n";

const rows = [
  [["fullName", "full_name", "name"], ["phone", "phone", "tel"]],
  [["province", "province", "address-level1"], ["district", "district", "address-level2"], ["ward", "ward", "address-level3"]],
  [["detail", "detail", "street-address"]],
];

export default function AddressFields({ value, onChange }) {
  const { t } = useI18n();

  return rows.map((row) => (
    <div key={row[0][0]} className="flex gap-4">
      {row.map(([name, label, autoComplete]) => (
        <input
          key={name}
          type={name === "phone" ? "tel" : "text"}
          name={name}
          autoComplete={autoComplete}
          aria-label={t(`address.${label}`)}
          placeholder={t(`address.${label}`)}
          value={value[name] ?? ""}
          onChange={onChange}
          className="min-w-0 flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-gray-400"
          required
        />
      ))}
    </div>
  ));
}
