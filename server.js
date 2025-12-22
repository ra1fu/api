const express = require("express");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

function pick(obj, pathArr, def = null) {
  try {
    return pathArr.reduce((acc, k) => acc[k], obj) ?? def;
  } catch {
    return def;
  }
}

async function getRandomUser() {
  const resp = await axios.get("https://randomuser.me/api/?nat=us,gb,fr,de,es,it,ca,au,nz");
  const u = resp.data.results[0];

  const firstName = pick(u, ["name", "first"], "");
  const lastName = pick(u, ["name", "last"], "");
  const gender = pick(u, ["gender"], "");
  const age = pick(u, ["dob", "age"], null);
  const dob = pick(u, ["dob", "date"], "");
  const picture = pick(u, ["picture", "large"], "");
  const city = pick(u, ["location", "city"], "");
  const country = pick(u, ["location", "country"], "");

  const streetNumber = pick(u, ["location", "street", "number"], "");
  const streetName = pick(u, ["location", "street", "name"], "");
  const fullAddress = `${streetNumber} ${streetName}, ${city}, ${country}`;

  return {
    firstName,
    lastName,
    gender,
    picture,
    age,
    dob,
    city,
    country,
    fullAddress
  };
}

async function getCountryInfo(countryName) {
  const headers = {};
  if (process.env.RESTCOUNTRIES_KEY) {
    headers["x-api-key"] = process.env.RESTCOUNTRIES_KEY;
  }

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;

  try {
    const resp = await axios.get(url, { headers });
    const c = resp.data[0];

    const name = pick(c, ["name", "common"], countryName);
    const capital = (pick(c, ["capital"], []) || [])[0] ?? "N/A";

    const languagesObj = pick(c, ["languages"], {});
    const languages = languagesObj ? Object.values(languagesObj) : [];
    const currencyObj = pick(c, ["currencies"], {});
    const currencyCode = currencyObj ? Object.keys(currencyObj)[0] : null;
    const currencyName = currencyCode ? pick(currencyObj, [currencyCode, "name"], "") : "";
    const flag = pick(c, ["flags", "png"], "") || pick(c, ["flags", "svg"], "");

    return {
      name,
      capital,
      languages: languages.length ? languages : ["N/A"],
      currency: currencyCode
        ? { code: currencyCode, name: currencyName || currencyCode }
        : { code: null, name: "N/A" },
      flag
    };
  } catch {
    return {
      name: countryName,
      capital: "N/A",
      languages: ["N/A"],
      currency: { code: null, name: "N/A" },
      flag: ""
    };
  }
}

async function getExchangeRates(baseCurrency) {
  const key = process.env.EXCHANGE_RATE_KEY;
  if (!key || !baseCurrency) {
    return {
      base: baseCurrency || "N/A",
      USD: null,
      KZT: null
    };
  }

  try {
    const url = `https://v6.exchangerate-api.com/v6/${key}/latest/${baseCurrency}`;
    const resp = await axios.get(url);

    const rates = resp.data.conversion_rates || {};
    const usd = rates.USD ?? null;
    const kzt = rates.KZT ?? null;

    return { base: baseCurrency, USD: usd, KZT: kzt };
  } catch {
    return { base: baseCurrency, USD: null, KZT: null };
  }
}

async function getNews(countryName) {
  const key = process.env.NEWS_API_KEY;
  if (!key || !countryName) return [];

  // Требование: 5 заголовков на английском и headline должен содержать название страны
  const q = `"${countryName}"`;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${key}`;

  try {
    const resp = await axios.get(url);
    const articles = resp.data.articles || [];

    return articles.slice(0, 5).map(a => ({
      title: a.title || "No title",
      description: a.description || "",
      url: a.url || "",
      image: a.urlToImage || "",
      source: pick(a, ["source", "name"], "Unknown")
    }));
  } catch {
    return [];
  }
}

app.get("/api/profile", async (req, res) => {
  try {
    const user = await getRandomUser();
    const countryInfo = await getCountryInfo(user.country);
    const rates = await getExchangeRates(countryInfo.currency.code);
    const news = await getNews(user.country);

    res.json({
      user,
      countryInfo,
      exchange: rates,
      news
    });
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
