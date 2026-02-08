import { useState, useEffect } from "react";
import { Timepicker } from "../../Timepicker";
import { PluginRegistry } from "timepicker-ui";
import type { TimepickerOptions } from "../../index";

function App() {
  const [time, setTime] = useState("");
  const [controlledTime, setControlledTime] = useState("02:30 AM");
  const [pluginsLoaded, setPluginsLoaded] = useState(false);

  useEffect(() => {
    const registerPlugins = async () => {
      try {
        const { TimezonePlugin } =
          await import("timepicker-ui/plugins/timezone");
        const { RangePlugin } = await import("timepicker-ui/plugins/range");

        PluginRegistry.register(TimezonePlugin);
        PluginRegistry.register(RangePlugin);

        setPluginsLoaded(true);
        console.log("✅ Plugins registered");
      } catch (error) {
        console.error("❌ Failed to load plugins:", error);
      }
    };

    registerPlugins();
  }, []);

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
          <h2>All Callbacks</h2>
          <Timepicker
            options={{
              ui: { theme: "crane" },
            }}
            placeholder="Check console for events"
            className="demo-input"
            onOpen={(data) => console.log("🟢 Open:", data)}
            onConfirm={(data) => console.log("✅ Confirm:", data)}
            onCancel={(data) => console.log("❌ Cancel:", data)}
            onUpdate={(data) => console.log("🔄 Update:", data)}
            onSelectHour={(data) => console.log("🕐 Hour:", data)}
            onSelectMinute={(data) => console.log("🕑 Minute:", data)}
            onSelectAM={(data) => console.log("🌅 AM:", data)}
            onSelectPM={(data) => console.log("🌆 PM:", data)}
            onError={(data) => console.log("⚠️ Error:", data)}
          />
        </section>

        <section className="demo-section">
          <h2>Timezone Support</h2>
          {!pluginsLoaded && <p className="result">Loading plugins...</p>}
          {pluginsLoaded && (
            <Timepicker
              options={{
                ui: { theme: "m2" },
                timezone: {
                  enabled: true,
                },
              }}
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
              options={{
                ui: { theme: "dark" },
                range: {
                  enabled: true,
                },
              }}
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
