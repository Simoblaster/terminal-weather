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
  `,
};

const weatherEmojis = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "🌨️",
  Thunderstorm: "⛈️",
  Drizzle: "🌧️",
  Mist: "🌫️",
  Fog: "🌫️",
};

const DEFAULT_CITY = "Roma,IT";

const Loading = () => (
  <Box marginTop={1}>
    <Text color="yellow">
      <Spinner type="dots" /> Loading...
    </Text>
  </Box>
);

const WeatherArtDisplay = ({ weatherData }) => {
  if (!weatherData) return null;

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="100%"
      justifyContent="center"
    >
      <Text>{weatherArt[weatherData.weather[0].main] || weatherArt.Clear}</Text>
      <Text bold>
        {weatherData.weather[0].description.charAt(0).toUpperCase() +
          weatherData.weather[0].description.slice(1)}
      </Text>
    </Box>
  );
};

const WatherDataDisplay = ({ weatherData }) => {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="100%"
      justifyContent="center"
    >
      <Text bold>
        Weather in {weatherData.name}, {weatherData.sys.country}
      </Text>
      <Text bold>
        Temperature: {Math.round(weatherData.main.temp - 273.15)}°C
      </Text>
      <Text>
        Min: {Math.round(weatherData.main.temp_min - 273.15)}°C | Max:{" "}
        {Math.round(weatherData.main.temp_max - 273.15)}°C
      </Text>
      <Text>Humidity: {weatherData.main.humidity}%</Text>
      <Text>Wind: {weatherData.wind.speed} m/s</Text>
      <Text>Pressure: {weatherData.main.pressure} hPa</Text>
    </Box>
  );
};

const WeatherRight = ({
  weatherData,
  forecastData,
  isNarrowTerminal,
  isVeryNarrow,
}) => {
  if (!weatherData) return null;

  return (
    <Box
      width={isNarrowTerminal ? "100%" : "50%"}
      height={isVeryNarrow ? "60%" : isNarrowTerminal ? "50%" : "100%"}
      flexDirection="column"
      padding={1}
    >
      <Box
        flexDirection="column"
        width="100%"
        height="50%"
        borderStyle="single"
      >
        <Box
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <WeatherArtDisplay weatherData={weatherData} />
        </Box>
      </Box>
      <Box
        flexDirection="column"
        width="100%"
        height="50%"
        borderStyle="single"
      >
        <Box
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <HourlyForecast forecastData={forecastData} />
        </Box>
      </Box>
    </Box>
  );
};

const WeatherLeft = ({ weatherData, isNarrowTerminal, isVeryNarrow }) => {
  if (!weatherData) return null;

  return (
    <Box
      width={isNarrowTerminal ? "100%" : "50%"}
      height={isVeryNarrow ? "60%" : isNarrowTerminal ? "50%" : "100%"}
      flexDirection="column"
      padding={1}
    >
      <Box
        flexDirection="column"
        width="100%"
        height="50%"
        borderStyle="single"
      >
        <Box
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <WatherDataDisplay weatherData={weatherData} />
        </Box>
      </Box>
      <Box
        flexDirection="column"
        width="100%"
        height="50%"
        borderStyle="single"
      >
        <Box
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <SunInfo weatherData={weatherData} />
        </Box>
      </Box>
    </Box>
  );
};

const SunInfo = ({ weatherData }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDayDuration = (sunrise, sunset) => {
    const duration = sunset - sunrise;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const sunrise = formatTime(weatherData.sys.sunrise);
  const sunset = formatTime(weatherData.sys.sunset);
  const dayDuration = calculateDayDuration(
    weatherData.sys.sunrise,
    weatherData.sys.sunset
  );

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="100%"
      justifyContent="center"
    >
      <Text bold>Sun Data</Text>
      <Text>Sunrise: 🌅 {sunrise}</Text>
      <Text>Sunset: 🌇 {sunset}</Text>
      <Text>Day Length: ⏱️ {dayDuration}</Text>
    </Box>
  );
};

const HourlyForecast = ({ forecastData }) => {
  if (!forecastData) return null;

  const nextHours = forecastData.list.slice(0, 4);

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      width="100%"
      height="100%"
      justifyContent="center"
    >
      <Text>Next hours:</Text>
      {nextHours.map((hour, index) => (
        <Text key={index}>
          {String(new Date(hour.dt * 1000).getHours()).padStart(2, "0")}:00
          {" - "}
          {weatherEmojis[hour.weather[0].main] || "❓"}
          {" | "}
          {Math.round(hour.main.temp - 273.15)}°C
        </Text>
      ))}
    </Box>
  );
};

const WeatherApp = () => {
  const { exit } = useApp();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [dimensions, setDimensions] = useState({
    width: process.stdout.columns,
    height: process.stdout.rows,
  });

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }
  });

  useEffect(() => {
    process.stdout.write("\x1Bc");
    const handleResize = () => {
      setDimensions({
        width: process.stdout.columns,
        height: process.stdout.rows,
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
        const weatherResponse = await fetch(
          `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        const weatherResult = await weatherResponse.json();

        const forecastResponse = await fetch(
          `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
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

  return (
    <Box
      flexDirection={isNarrowTerminal ? "column" : "row"}
      height={dimensions.height}
      minHeight={dimensions.height}
      justifyContent="center"
    >
      {error && <Text color="red">{error}</Text>}
      {loading && !error ? (
        <Loading />
      ) : (
        <>
          <WeatherLeft
            weatherData={weatherData}
            isNarrowTerminal={isNarrowTerminal}
            isVeryNarrow={isVeryNarrow}
          />
          <WeatherRight
            weatherData={weatherData}
            forecastData={forecastData}
            isNarrowTerminal={isNarrowTerminal}
            isVeryNarrow={isVeryNarrow}
          />
        </>
      )}
    </Box>
  );
};

const { clear } = render(<WeatherApp />);
