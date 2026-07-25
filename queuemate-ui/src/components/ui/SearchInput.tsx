import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

export default function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="search-input">
      <Search size={17} />
      <input type="search" {...props} />
    </label>
  );
}
