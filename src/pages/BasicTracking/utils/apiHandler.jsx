import foetusService from "../../../api/services/foetusService"
import growthStatsService from "../../../api/services/growthStatsService"

const GROWTH_STANDARD_API = "https://pregnancy-growth-tracking-web-api-a6hxfqhsenaagthw.australiasoutheast-01.azurewebsites.net/api/GrowthStandard"

export const fetchFoetusData = async () => {
  try {
    const foetusData = await foetusService.getFoetusList()
    return foetusData
  } catch (err) {
    throw err
  }
}

export const fetchGrowthData = async (foetusData) => {
  try {
    const growthPromises = foetusData.map((foetus) =>
      growthStatsService
        .getGrowthData(foetus.foetusId)
        .then((data) => ({ [foetus.foetusId]: data }))
        .catch(() => ({ [foetus.foetusId]: [] }))
    )
    return Object.assign({}, ...(await Promise.all(growthPromises)))
  } catch (err) {
    throw err
  }
}

export const fetchStandardRanges = async (age) => {
  try {
    if (!age || age < 12 || age > 40) {
      return null;
    }

    const token = localStorage.getItem('token');

    const url = new URL(GROWTH_STANDARD_API);
    url.searchParams.append('week', age.toString());

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    let standardData = null;
    if (Array.isArray(data)) {
      standardData = data.find(item => item.gestationalAge === parseInt(age));
    }

    if (!standardData) {
      return null;
    }

    const result = {
      hc: {
        min: standardData.hcMedian * 0.9,
        max: standardData.hcMedian * 1.1,
        median: standardData.hcMedian
      },
      ac: {
        min: standardData.acMedian * 0.9,
        max: standardData.acMedian * 1.1,
        median: standardData.acMedian
      },
      fl: {
        min: standardData.flMedian * 0.9,
        max: standardData.flMedian * 1.1,
        median: standardData.flMedian
      },
      efw: {
        min: standardData.efwMedian * 0.9,
        max: standardData.efwMedian * 1.1,
        median: standardData.efwMedian
      }
    };

    return result;
  } catch (err) {
    return null;
  }
}

export const updateGrowthStats = async (foetusId, updateData) => {
  try {
    const result = await growthStatsService.updateGrowthStats(foetusId, updateData)
    return result
  } catch (err) {
    throw err
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('token') || '';
} 