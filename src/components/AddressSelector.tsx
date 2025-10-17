// src/components/AddressSelector.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Map, Home, Landmark, ToggleRight, ToggleLeft, MapPinHouse, ArrowDownToLine, LandPlot } from "lucide-react";

export interface StateItem {
  iso2: string; // e.g. "MH"
  name: string;
}

export interface CityItem {
  name: string;
}

export interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

interface Props {
  stateValue: string;
  cityValue: string;
  localityValue: string;
  addressValue?: string;
  pincodeValue?: number;
  nearbyPlaceValue?: string;
  onChange: (changes: {
    state?: string;
    city?: string;
    locality?: string;
    address?: string;
    pincode?: number;
    nearbyPlace?: string;
  }) => void;
}

const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

// --- Local UI styles for consistent look ---
const INPUT_CLASS =
  "w-full bg-white border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition";
const SELECT_CLASS = INPUT_CLASS;

const AddressSelector: React.FC<Props> = ({
  stateValue,
  cityValue,
  localityValue,
  addressValue,
  pincodeValue,
  nearbyPlaceValue,
  onChange,
}) => {
  const [pincode, setPincode] = useState<string>("");
  const [isManual, setIsManual] = useState<boolean>(false);

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);

  const [addressText, setAddressText] = useState<string>("");
  const [nearbyPlace, setNearbyPlace] = useState<string>("");

  const [selectedStateIso2, setSelectedStateIso2] = useState<string>("");

  useEffect(() => {
    setAddressText(addressValue ?? "");
    setNearbyPlace(nearbyPlaceValue ?? "");
    setPincode(pincodeValue ? String(pincodeValue) : "");
  }, [addressValue, nearbyPlaceValue, pincodeValue]);

  useEffect(() => {
    const pin = pincodeValue ? String(pincodeValue) : "";
    if (!isManual && pin.length === 6) {
      setPincode(pin);
    }
  }, [isManual, pincodeValue]);

  // Load post offices by pincode
  const handleLoad = async () => {
    if (!pincode) return alert("Enter pincode");
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = res.data?.[0];
      if (data && data.Status === "Success") {
        const poList: PostOffice[] = data.PostOffice || [];
        setPostOffices(poList);
        if (poList.length > 0) {
          onChange({
            state: poList[0].State,
            city: poList[0].District,
            locality: poList[0].Name,
            pincode: Number(pincode),
            nearbyPlace: "",
            address: "",
          });
        } else {
          alert("No post offices found for this pincode");
        }
      } else {
        alert("Invalid Pincode");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load pincode data");
    }
  };

  // Toggle manual mode -> fetch states if entering manual
  const handleManualToggle = async () => {
    const enteringManual = !isManual;
    setIsManual(enteringManual);

    if (enteringManual) {
      if (!CSC_API_KEY) {
        alert("CSC API key not set. Please set VITE_CSC_API_KEY in .env");
        onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
        setCities([]);
        setPostOffices([]);
        return;
      }

      try {
        const res = await axios.get<StateItem[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
          headers: { "X-CSCAPI-KEY": CSC_API_KEY },
        });
        const stateList: StateItem[] = (res.data || []).map((s: any) => ({
          iso2: s.iso2,
          name: s.name,
        }));
        setStates(stateList);
        onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
        setCities([]);
        setPostOffices([]);
        setSelectedStateIso2("");
      } catch (err) {
        console.error(err);
        alert("Failed to load states from countrystatecity.in (check API key & network).");
      }
    } else {
      setStates([]);
      setCities([]);
      setPostOffices([]);
      onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
      setSelectedStateIso2("");
    }
  };

  // When user selects a state (manual) fetch cities
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    setSelectedStateIso2(iso2);
    const stateObj = states.find((s) => s.iso2 === iso2);
    const stateName = stateObj ? stateObj.name : "";
    onChange({ state: stateName, city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });

    if (!iso2) {
      setCities([]);
      return;
    }

    if (!CSC_API_KEY) {
      alert("CSC API key not set. Please set VITE_CSC_API_KEY in .env");
      return;
    }

    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const cityList: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
      setCities(cityList);
    } catch (err) {
      console.error(err);
      alert("Failed to load cities for selected state (check API key & network).");
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    onChange({ city: cityName, locality: "" });
  };

  const handleLocalityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ locality: e.target.value });
  };

  const handleAddressTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressText(e.target.value);
    onChange({ address: e.target.value });
  };

  const handleNearbyPlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNearbyPlace(e.target.value);
    onChange({ nearbyPlace: e.target.value });
  };

  const handleManualPincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPincode(digits);
    const num = digits ? Number(digits) : undefined;
    onChange({ pincode: num });
  };

  return (
    <div className="space-y-5">
      {/* Top row: Pincode | Load | Manual toggle
          - phone: stack (grid-cols-1)
          - tablet and up: 3 columns (grid-cols-3)
          - buttons full-width on small screens for tap targets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="w-full">
          {!isManual ? (
            <input
              className={INPUT_CLASS}
              type="text"
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            />
          ) : (
            <input
              type="text"
              onChange={handleManualPincodeChange}
              className={INPUT_CLASS}
              placeholder="Enter Pincode"
              value={pincode}
            />
          )}
        </div>

        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handleLoad}
            disabled={isManual}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 rounded border px-3 py-2 text-sm transition
              ${isManual ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" : "border-orange-400 bg-orange-50 text-orange-600 hover:bg-orange-100"}`}
            aria-disabled={isManual}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span className="truncate">Load</span>
          </button>
        </div>

        <div className="w-full flex justify-end sm:justify-end">
          <button
            type="button"
            onClick={handleManualToggle}
            aria-pressed={isManual}
            className="inline-flex items-center gap-2 text-[15px] text-gray-700 hover:text-gray-900 transition"
          >
            {isManual ? <ToggleRight className="w-12 h-8 text-orange-600" /> : <ToggleLeft className="w-12 h-8 text-gray-400" />}
            <span className="hidden sm:inline">Enter Address Manually</span>
            <span className="sm:hidden text-sm">{isManual ? "Manual" : "Auto"}</span>
          </button>
        </div>
      </div>

      {/* State / City / Locality
          - phone: stack
          - md and up: 3 columns
          This preserves desktop/laptop layout while making mobiles stack */}
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
            <LandPlot className="w-3 h-3 text-orange-500" /> State
          </label>
          {isManual ? (
            <select value={selectedStateIso2} onChange={handleStateChange} className={SELECT_CLASS}>
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.iso2} value={s.iso2}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={stateValue}
              disabled
              className={`${INPUT_CLASS} bg-gray-100 text-gray-500 cursor-not-allowed`}
              placeholder="State"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
            <Map className="w-3 h-3 text-orange-500" /> City
          </label>
          {isManual ? (
            <select value={cityValue} onChange={handleCityChange} className={SELECT_CLASS}>
              <option value="">-- Select City --</option>
              {cities.map((c, idx) => (
                <option key={idx} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={cityValue}
              disabled
              className={`${INPUT_CLASS} bg-gray-100 text-gray-500 cursor-not-allowed`}
              placeholder="City"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
            <MapPinHouse className="w-3 h-3 text-orange-500" /> Locality
          </label>
          {isManual ? (
            <input type="text" value={localityValue} onChange={handleLocalityChange} className={INPUT_CLASS} placeholder="Enter Locality" />
          ) : (
            <select value={localityValue} onChange={handleLocalityChange} className={SELECT_CLASS}>
              <option value="">-- Select Locality --</option>
              {postOffices.map((po) => (
                <option key={po.Name} value={po.Name}>
                  {po.Name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Address & Nearby Place
          - phone: stacked
          - md+: two columns */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
            <Home className="w-3 h-3 text-orange-500" /> Address
          </label>
          <input type="text" value={addressText} onChange={handleAddressTextChange} className={INPUT_CLASS} placeholder="House/Street/Area" />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
            <Landmark className="w-3 h-3 text-orange-500" /> Nearby Place
          </label>
          <input type="text" value={nearbyPlace} onChange={handleNearbyPlaceChange} className={INPUT_CLASS} placeholder="Landmark" />
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
