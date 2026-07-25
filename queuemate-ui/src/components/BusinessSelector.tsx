import { Building2 } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";

export default function BusinessSelector() {
  const {
    businesses,
    currentBusinessId,
    selectBusiness,
    isLoadingBusinesses,
  } = useBusiness();

  if (isLoadingBusinesses) {
    return <span>Loading businesses...</span>;
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <label>
      <span>
        <Building2 size={18} />
        Business
      </span>

      <select
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
      </select>
    </label>
  );
}