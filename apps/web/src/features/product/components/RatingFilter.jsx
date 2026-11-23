import { useId } from "react";

export default function RatingFilter({ minRating, onChange }) {
  const groupName = useId();

  return (
    <div className="mb-5">
      <h4 className="text-sm font-medium mb-2">Đánh Giá</h4>
      <div className="space-y-2 text-sm">
        {[5, 4, 3].map((star) => (
          <label key={star} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={groupName}
              className="radio radio-xs radio-primary"
              checked={Number(minRating) === star}
              onChange={() => onChange(star)}
            />
            <span>{star} sao{star < 5 ? " trở lên" : ""}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
