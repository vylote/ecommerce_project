import { useId } from "react";
import TextField from "../../../shared/ui/TextField";

const fields = [
  { name: "price", label: "Giá bán (₫)", placeholder: "Ví dụ: 150000" },
  { name: "stock", label: "Số lượng hàng sẵn có tại kho", placeholder: "Ví dụ: 50" },
];

export default function ProductInventoryFields({ productForm, errors, onChange }) {
  const id = useId();

  return (
    <div className="grid gap-5 pt-2 sm:grid-cols-2">
      {fields.map(({ name, label, placeholder }) => {
        const errorId = `${id}-${name}-error`;
        return (
          <div key={name}>
            <TextField
              name={name}
              type="number"
              label={label}
              placeholder={placeholder}
              value={productForm[name]}
              onChange={onChange}
              aria-required="true"
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? errorId : undefined}
            />
            {errors[name] && <p id={errorId} className="mt-1 text-xs text-error">{errors[name]}</p>}
          </div>
        );
      })}
    </div>
  );
}
