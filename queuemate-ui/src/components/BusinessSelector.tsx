import { Building2 } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import Select from "./ui/Select";

export default function BusinessSelector() {
  const {
    businesses,
    currentBusinessId,
    selectBusiness,
    isLoadingBusinesses,
  } = useBusiness();

  if (isLoadingBusinesses) {
    return (
      <div className="business-selector">
        <span>
          <Building2 size={18} />
          Loading businesses...
        </span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="business-selector">
      <span>
        <Building2 size={18} />
        Business
      </span>

      <Select
        aria-label="Current business"
        value={currentBusinessId ?? ""}
        onChange={(event) =>
          selectBusiness(event.target.value)
        }
      >
        {businesses.map((business) => (
          <option
            key={business.id}
            value={business.id}
          >
            {business.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
