import React, { useState, useEffect } from "react";
import { render, Text, Box, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
const weatherArt = {
  Clear: `
       \\   /
        .-.
     ‒ (   ) ‒
        '-'
       /   \\
  `,
  Clouds: `
       .--.
    .-(    ).
   (___.__)__)
  `,
  Rain: `
        .-.
       (   ).
      (___(__)
      ' ' ' '
     ' ' ' '
  `,
  Snow: `
        .-.
       (   ).
      (___(__)
       *  *  *
      *  *  *
  `
};
const weatherEmojis = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "🌨️",
  Thunderstorm: "⛈️",
  Drizzle: "🌧️",
  Mist: "🌫️",
  Fog: "🌫️"
};
const DEFAULT_CITY = "Roma,IT";
const Loading = () => /*#__PURE__*/React.createElement(Box, {
  marginTop: 1
}, /*#__PURE__*/React.createElement(Text, {
  color: "yellow"
}, /*#__PURE__*/React.createElement(Spinner, {
  type: "dots"
}), " Loading..."));
const WeatherArtDisplay = ({
  weatherData
}) => {
  if (!weatherData) return null;
  return /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center"
  }, /*#__PURE__*/React.createElement(Text, null, weatherArt[weatherData.weather[0].main] || weatherArt.Clear), /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1)));
};
const WatherDataDisplay = ({
  weatherData
}) => {
  return /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center"
  }, /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Weather in ", weatherData.name, ", ", weatherData.sys.country), /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Temperature: ", Math.round(weatherData.main.temp - 273.15), "\xB0C"), /*#__PURE__*/React.createElement(Text, null, "Min: ", Math.round(weatherData.main.temp_min - 273.15), "\xB0C | Max:", " ", Math.round(weatherData.main.temp_max - 273.15), "\xB0C"), /*#__PURE__*/React.createElement(Text, null, "Humidity: ", weatherData.main.humidity, "%"), /*#__PURE__*/React.createElement(Text, null, "Wind: ", weatherData.wind.speed, " m/s"), /*#__PURE__*/React.createElement(Text, null, "Pressure: ", weatherData.main.pressure, " hPa"));
};
const WeatherRight = ({
  weatherData,
  forecastData,
  isNarrowTerminal,
  isVeryNarrow
}) => {
  if (!weatherData) return null;
  return /*#__PURE__*/React.createElement(Box, {
    width: isNarrowTerminal ? "100%" : "50%",
    height: isVeryNarrow ? "60%" : isNarrowTerminal ? "50%" : "100%",
    flexDirection: "column",
    padding: 1
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "50%",
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement(WeatherArtDisplay, {
    weatherData: weatherData
  }))), /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "50%",
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement(HourlyForecast, {
    forecastData: forecastData
  }))));
};
const WeatherLeft = ({
  weatherData,
  isNarrowTerminal,
  isVeryNarrow
}) => {
  if (!weatherData) return null;
  return /*#__PURE__*/React.createElement(Box, {
    width: isNarrowTerminal ? "100%" : "50%",
    height: isVeryNarrow ? "60%" : isNarrowTerminal ? "50%" : "100%",
    flexDirection: "column",
    padding: 1
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "50%",
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement(WatherDataDisplay, {
    weatherData: weatherData
  }))), /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "50%",
    borderStyle: "single"
  }, /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/React.createElement(SunInfo, {
    weatherData: weatherData
  }))));
};
const SunInfo = ({
  weatherData
}) => {
  const formatTime = timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const calculateDayDuration = (sunrise, sunset) => {
    const duration = sunset - sunrise;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor(duration % 3600 / 60);
    return `${hours}h ${minutes}m`;
  };
  const sunrise = formatTime(weatherData.sys.sunrise);
  const sunset = formatTime(weatherData.sys.sunset);
  const dayDuration = calculateDayDuration(weatherData.sys.sunrise, weatherData.sys.sunset);
  return /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center"
  }, /*#__PURE__*/React.createElement(Text, {
    bold: true
  }, "Sun Data"), /*#__PURE__*/React.createElement(Text, null, "Sunrise: \uD83C\uDF05 ", sunrise), /*#__PURE__*/React.createElement(Text, null, "Sunset: \uD83C\uDF07 ", sunset), /*#__PURE__*/React.createElement(Text, null, "Day Length: \u23F1\uFE0F ", dayDuration));
};
const HourlyForecast = ({
  forecastData
}) => {
  if (!forecastData) return null;
  const nextHours = forecastData.list.slice(0, 4);
  return /*#__PURE__*/React.createElement(Box, {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center"
  }, /*#__PURE__*/React.createElement(Text, null, "Next hours:"), nextHours.map((hour, index) => /*#__PURE__*/React.createElement(Text, {
    key: index
  }, String(new Date(hour.dt * 1000).getHours()).padStart(2, "0"), ":00", " - ", weatherEmojis[hour.weather[0].main] || "❓", " | ", Math.round(hour.main.temp - 273.15), "\xB0C")));
};
const WeatherApp = () => {
  const {
    exit
  } = useApp();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [dimensions, setDimensions] = useState({
    width: process.stdout.columns,
    height: process.stdout.rows
  });
  useInput((input, key) => {
    if (input === "q" || key.ctrl && input === "c") {
      exit();
    }
  });
  useEffect(() => {
    process.stdout.write("\x1Bc");
    const handleResize = () => {
      setDimensions({
        width: process.stdout.columns,
        height: process.stdout.rows
      });
    };
    process.stdout.on("resize", handleResize);
    return () => {
      process.stdout.removeListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherResponse = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.OPENWEATHER_API_KEY}`);
        const weatherResult = await weatherResponse.json();
        const forecastResponse = await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${process.env.OPENWEATHER_API_KEY}`);
        const forecastResult = await forecastResponse.json();
        if (weatherResponse.ok && forecastResponse.ok) {
          setWeatherData(weatherResult);
          setForecastData(forecastResult);
        } else {
          setError(weatherResult.message || forecastResult.message);
        }
      } catch (error) {
        console.log(error);
        setError("Error loading weather data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cityName]);
  useEffect(() => {
    process.stdout.write("\x1Bc");
  }, [dimensions]);
  const isVeryNarrow = dimensions.width < 60;
  const isNarrowTerminal = dimensions.width < 80;
  return /*#__PURE__*/React.createElement(Box, {
    flexDirection: isNarrowTerminal ? "column" : "row",
    height: dimensions.height,
    minHeight: dimensions.height,
    justifyContent: "center"
  }, error && /*#__PURE__*/React.createElement(Text, {
    color: "red"
  }, error), loading && !error ? /*#__PURE__*/React.createElement(Loading, null) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(WeatherLeft, {
    weatherData: weatherData,
    isNarrowTerminal: isNarrowTerminal,
    isVeryNarrow: isVeryNarrow
  }), /*#__PURE__*/React.createElement(WeatherRight, {
    weatherData: weatherData,
    forecastData: forecastData,
    isNarrowTerminal: isNarrowTerminal,
    isVeryNarrow: isVeryNarrow
  })));
};
const {
  clear
} = render(/*#__PURE__*/React.createElement(WeatherApp, null));
