"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Shared hook for Country State City API data.
 * Used by checkout (address) and shipping zones (zone coverage).
 */
export function useGeoData() {
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    useEffect(() => {
        axios
            .get("/api/geo/countries")
            .then(({ data }) => {
                if (data.success && Array.isArray(data.data)) {
                    setCountries(data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingCountries(false));
    }, []);

    const fetchStates = useCallback(async (countryCode) => {
        if (!countryCode?.trim()) return [];
        try {
            const { data } = await axios.get("/api/geo/states", {
                params: { country: countryCode.trim() },
            });
            return data.success && Array.isArray(data.data) ? data.data : [];
        } catch {
            return [];
        }
    }, []);

    const fetchCities = useCallback(async (countryCode, stateCode) => {
        if (!countryCode?.trim() || !stateCode?.trim()) return [];
        try {
            const { data } = await axios.get("/api/geo/cities", {
                params: { country: countryCode.trim(), state: stateCode.trim() },
            });
            return data.success && Array.isArray(data.data) ? data.data : [];
        } catch {
            return [];
        }
    }, []);

    return {
        countries,
        loadingCountries,
        fetchStates,
        fetchCities,
    };
}
