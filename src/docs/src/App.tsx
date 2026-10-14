import { useState, useEffect } from "react";
import { Timepicker, PluginRegistry } from "timepicker-ui-react";
import type { TimepickerOptions } from "timepicker-ui-react";

const basicOptions: TimepickerOptions = {
  ui: {
    theme: "m3-green",
  },
};

const advancedOptions: TimepickerOptions = {
  clock: {
    type: "24h",
    autoSwitchToMinutes: true,
    incrementMinutes: 5,
  },
  ui: {
    theme: "dark",
    mobile: false,
  },
  labels: {
    ok: "Potwierdź",
    cancel: "Anuluj",
    time: "Wybierz czas",
  },
};

const secondsOptions: TimepickerOptions = {
  clock: {
    type: "12h",
    showSeconds: true,
    autoSwitchToSeconds: true,
  },
};

const callbacksOptions: TimepickerOptions = {
  clock: { showSeconds: true },
  ui: { theme: "crane", viewSwitch: true },
};

const timezoneOptions: TimepickerOptions = {
  ui: { theme: "m2" },
  timezone: {
    enabled: true,
  },
};

const rangeOptions: TimepickerOptions = {
  ui: { theme: "dark" },
  range: {
    enabled: true,
  },
};

const wheelOptions: TimepickerOptions = {
  clock: { showSeconds: true },
  ui: { mode: "wheel", theme: "m3-green" },
};

function App() {
  const [time, setTime] = useState("");
  const [controlledTime, setControlledTime] = useState("02:30 AM");
  const [secondsTime, setSecondsTime] = useState("02:30:15 PM");
  const [pluginsLoaded, setPluginsLoaded] = useState(false);

  useEffect(() => {
    const registerPlugins = async () => {
      try {
        const { TimezonePlugin } =
          await import("timepicker-ui/plugins/timezone");
        const { RangePlugin } = await import("timepicker-ui/plugins/range");
        const { WheelPlugin } = await import("timepicker-ui/plugins/wheel");

        PluginRegistry.register(TimezonePlugin);
        PluginRegistry.register(RangePlugin);
        PluginRegistry.register(WheelPlugin);

        setPluginsLoaded(true);
        console.log("✅ Plugins registered");
      } catch (error) {
        console.error("❌ Failed to load plugins:", error);
      }
    };

    registerPlugins();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>⏰ Timepicker UI React</h1>
        <p>Official React wrapper for timepicker-ui v4.x</p>
      </header>

      <div className="container">
        <section className="demo-section">
          <h2>Basic Example</h2>
          <Timepicker
            placeholder="Select time"
            className="demo-input"
            onConfirm={(data) => {
              console.log("Confirmed:", data);
              setTime(`${data.hour}:${data.minutes}`);
            }}
          />
          {time && <p className="result">Selected: {time}</p>}
        </section>

        <section className="demo-section">
          <h2>With Theme (M3 Green)</h2>
          <Timepicker
            options={basicOptions}
            placeholder="Material 3 theme"
            className="demo-input"
            onConfirm={(data) => console.log("M3 confirmed:", data)}
          />
        </section>

        <section className="demo-section">
          <h2>Advanced Options (24h, Dark Theme)</h2>
          <Timepicker
            options={advancedOptions}
            placeholder="24h format, dark theme"
            className="demo-input"
            onUpdate={(data) =>
              console.log("Update:", `${data.hour}:${data.minutes}`)
            }
          />
        </section>

        <section className="demo-section">
          <h2>Controlled Component</h2>
          <Timepicker
            value={controlledTime}
            className="demo-input"
            onUpdate={(data) => {
              const newTime = `${data.hour}:${data.minutes} ${data.type}`;
              console.log("🔄 Update:", newTime);
              setControlledTime(newTime);
            }}
            onConfirm={(data) => {
              const newTime = `${data.hour}:${data.minutes} ${data.type}`;
              console.log("✅ Confirm:", newTime);
              setControlledTime(newTime);
            }}
          />
          <p className="result">Controlled value: {controlledTime}</p>
          <button className="btn" onClick={() => setControlledTime("09:00 PM")}>
            Set to 09:00 PM
          </button>
        </section>

        <section className="demo-section">
          <h2>With Seconds (Controlled)</h2>
          <Timepicker
            options={secondsOptions}
            value={secondsTime}
            className="demo-input"
            onSelectSecond={(data) => console.log("🕒 Second:", data)}
            onConfirm={(data) => {
              const newTime = `${data.hour}:${data.minutes}:${data.seconds} ${data.type}`;
              console.log("✅ Confirm:", newTime);
              setSecondsTime(newTime);
            }}
          />
          <p className="result">Controlled value: {secondsTime}</p>
          <button className="btn" onClick={() => setSecondsTime("09:15:45 PM")}>
            Set to 09:15:45 PM
          </button>
        </section>

        <section className="demo-section">
          <h2>All Callbacks</h2>
          <Timepicker
            options={callbacksOptions}
            placeholder="Check console for events"
            className="demo-input"
            onShow={(data) => console.log("👀 Show:", data)}
            onOpen={(data) => console.log("🟢 Open:", data)}
            onConfirm={(data) => console.log("✅ Confirm:", data)}
            onCancel={(data) => console.log("❌ Cancel:", data)}
            onUpdate={(data) => console.log("🔄 Update:", data)}
            onSelectHour={(data) => console.log("🕐 Hour:", data)}
            onSelectMinute={(data) => console.log("🕑 Minute:", data)}
            onSelectSecond={(data) => console.log("🕒 Second:", data)}
            onSelectPeriod={(data) => console.log("🌗 Period:", data.type)}
            onSwitchView={(data) => console.log("🔀 Switch view:", data)}
            onError={(data) => console.log("⚠️ Error:", data)}
          />
        </section>

        <section className="demo-section">
          <h2>Timezone Support</h2>
          {!pluginsLoaded && <p className="result">Loading plugins...</p>}
          {pluginsLoaded && (
            <Timepicker
              options={timezoneOptions}
              placeholder="Select time with timezone"
              className="demo-input"
              onConfirm={(data) => console.log("✅ Confirmed with TZ:", data)}
              onTimezoneChange={(data) =>
                console.log("🌍 Timezone changed:", data)
              }
            />
          )}
        </section>

        <section className="demo-section">
          <h2>Range Selection</h2>
          {!pluginsLoaded && <p className="result">Loading plugins...</p>}
          {pluginsLoaded && (
            <Timepicker
              options={rangeOptions}
              placeholder="Select time range"
              className="demo-input"
              onRangeConfirm={(data) =>
                console.log("✅ Range confirmed:", data)
              }
              onRangeSwitch={(data) => console.log("🔄 Range switch:", data)}
              onRangeValidation={(data) =>
                console.log("✔️ Range validation:", data)
              }
            />
          )}
        </section>

        <section className="demo-section">
          <h2>Wheel Mode with Seconds</h2>
          {!pluginsLoaded && <p className="result">Loading plugins...</p>}
          {pluginsLoaded && (
            <Timepicker
              options={wheelOptions}
              placeholder="Scroll the wheel"
              className="demo-input"
              onConfirm={(data) => console.log("✅ Wheel confirmed:", data)}
              onWheelScrollStart={(data) =>
                console.log("🎡 Wheel scroll start:", data)
              }
              onWheelScrollEnd={(data) =>
                console.log("🛑 Wheel scroll end:", data)
              }
            />
          )}
        </section>
      </div>

      <footer className="footer">
        <p>
          <a
            href="https://github.com/pglejzer/timepicker-ui-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {" | "}
          <a
            href="https://github.com/pglejzer/timepicker-ui"
            target="_blank"
            rel="noopener noreferrer"
          >
            timepicker-ui core
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
