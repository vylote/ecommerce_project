import { useI18n } from "../../../shared/i18n";
import TextField from "../../../shared/ui/TextField";

const rows = [
  {
    className: "min-[420px]:grid-cols-2",
    fields: [
      { name: "fullName", label: "full_name", autoComplete: "name" },
      { name: "phone", label: "phone", autoComplete: "tel", type: "tel" },
    ],
  },
  {
    className: "sm:grid-cols-3",
    fields: [
      { name: "province", label: "province", autoComplete: "address-level1" },
      { name: "district", label: "district", autoComplete: "address-level2" },
      { name: "ward", label: "ward", autoComplete: "address-level3" },
    ],
  },
  {
    className: "",
    fields: [
      { name: "detail", label: "detail", autoComplete: "street-address" },
    ],
  },
];

export default function AddressFields({ value, onChange }) {
  const { t } = useI18n();

  return rows.map(({ className, fields }) => (
    <div key={fields[0].name} className={`grid grid-cols-1 gap-4 ${className}`}>
      {fields.map(({ name, label, autoComplete, type = "text" }) => (
        <TextField
          key={name}
          label={t(`address.${label}`)}
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={value[name] ?? ""}
          onChange={onChange}
          compact
          required
        />
      ))}
    </div>
  ));
}
